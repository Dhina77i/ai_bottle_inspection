import base64
import contextlib
import math
import os
import threading
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import numpy as np

ULTRALYTICS_CONFIG_DIR = Path(__file__).resolve().parents[1] / ".ultralytics"
ULTRALYTICS_CONFIG_DIR.mkdir(parents=True, exist_ok=True)
os.environ.setdefault("YOLO_CONFIG_DIR", str(ULTRALYTICS_CONFIG_DIR))

try:
    from ultralytics import YOLO
except Exception:
    YOLO = None


CLASS_NAMES = [
    "bottle",
    "proper_fill",
    "under_fill",
    "over_fill",
    "label_ok",
    "label_torn",
    "label_missing",
]

DETECTION_COLORS: Dict[str, Tuple[int, int, int]] = {
    "bottle": (255, 255, 0),        # Cyan (BGR)
    "proper_fill": (0, 255, 0),     # Green (BGR)
    "under_fill": (0, 165, 255),    # Orange (BGR)
    "over_fill": (0, 0, 255),       # Red (BGR)
    "label_ok": (255, 0, 0),        # Blue (BGR)
    "label_torn": (0, 255, 255),    # Yellow (BGR)
    "label_missing": (255, 0, 255), # Purple (BGR)
}

CLASS_ALIASES = {
    "fill_proper": "proper_fill",
    "proper_fill": "proper_fill",
    "fill_under": "under_fill",
    "under_fill": "under_fill",
    "fill_over": "over_fill",
    "over_fill": "over_fill",
    "label_proper": "label_ok",
    "label_ok": "label_ok",
    "label_torn": "label_torn",
    "label_missing": "label_missing",
    "bottle": "bottle",
}

DISPLAY_NAMES = {
    "bottle": "bottle",
    "proper_fill": "proper_fill",
    "under_fill": "under_fill",
    "over_fill": "over_fill",
    "label_ok": "label_ok",
    "label_torn": "label_torn",
    "label_missing": "label_missing",
}


@dataclass
class FrameStats:
    total_bottles: int = 0
    passed: int = 0
    failed: int = 0
    proper_fill: int = 0
    under_fill: int = 0
    over_fill: int = 0
    label_ok: int = 0
    label_torn: int = 0
    label_missing: int = 0
    fps: float = 0.0
    detections: List[dict] = field(default_factory=list)

    def as_dict(self) -> dict:
        return {
            "total_bottles": self.total_bottles,
            "passed": self.passed,
            "failed": self.failed,
            "proper_fill": self.proper_fill,
            "under_fill": self.under_fill,
            "over_fill": self.over_fill,
            "label_ok": self.label_ok,
            "label_torn": self.label_torn,
            "label_missing": self.label_missing,
            "fps": round(self.fps, 2),
            "detections": self.detections,
        }


class BottleInspector:
    def __init__(self, model_variant: str = "upload") -> None:
        self.variant = model_variant
        self.confidence = float(os.getenv("CONFIDENCE_THRESHOLD", "0.35"))
        self.inference_size = self._parse_inference_size(os.getenv("YOLO_TARGET_SIZE", "640x480"))
        self.imgsz = int(os.getenv("YOLO_IMGSZ", str(max(self.inference_size))))
        self.target_fps = float(os.getenv("YOLO_TARGET_FPS", "30"))
        self.weights_path = self._select_weights_path()
        if not self.weights_path.is_absolute():
            self.weights_path = Path(__file__).resolve().parents[1] / self.weights_path
        self.model = None
        self.model_error = ""
        self.last_inference_device = "cpu"
        self.last_inference_fp16 = False
        self.debug = os.getenv("INFERENCE_DEBUG", "0") == "1"
        self.device = "cpu"
        self.half_precision = False
        default_stream = "0" if self.variant == "live" else "1"
        self.use_stream = os.getenv("YOLO_USE_STREAM", default_stream).lower() in {"1", "true", "yes"}
        fallback_default = "0" if self.variant == "live" else "1"
        self.allow_cpu_fallback = os.getenv("YOLO_ALLOW_CPU_FALLBACK", fallback_default).lower() in {"1", "true", "yes"}
        self.backend = os.getenv("YOLO_BACKEND", "").lower()
        self._track_lock = threading.Lock()
        self._frame_number = 0
        self._next_bottle_id = 1
        self._bottle_tracks: Dict[int, dict] = {}
        self._last_stats = None
        self._last_annotated = None
        self._last_inference_ts = 0.0
        self._last_inference_ms = 0.0
        self._rolling_fps = 0.0
        self._adaptive_delay = 0.0
        self.draw_summary_overlay = self.variant != "live"
        self._overlay_update_interval = 1.0 / max(float(os.getenv("OVERLAY_STATS_FPS", "6")), 1.0)
        self._overlay_stats = None
        self._overlay_signature = None
        self._overlay_last_update = 0.0
        self.load_model()

    @property
    def ready(self) -> bool:
        return self.model is not None

    def load_model(self) -> None:
        if YOLO is None:
            self.model_error = "Ultralytics is not installed or could not be imported."
            if self.debug:
                print(f"--- MODEL LOAD ERROR: {self.model_error}")
            return
        if not self.weights_path.exists():
            self.model_error = f"YOLO weights not found at {self.weights_path}."
            if self.debug:
                print(f"--- MODEL LOAD ERROR: {self.model_error}")
            return
        try:
            # Load Ultralytics YOLO model natively and pin to device once.
            self.model = YOLO(str(self.weights_path))
            import torch
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            self.half_precision = self.device == "cuda"
            if self.device == "cuda":
                gpu_name = torch.cuda.get_device_name(0)
                reserved = torch.cuda.memory_reserved(0) / (1024 * 1024)
                allocated = torch.cuda.memory_allocated(0) / (1024 * 1024)
                self.model.to(self.device)
                with contextlib.suppress(Exception):
                    self.model.half()
                torch.backends.cudnn.benchmark = True
                print(
                    f"--- CUDA ACTIVE: available=True gpu={gpu_name} "
                    f"model_device={self.device} fp16={self.half_precision} "
                    f"allocated={allocated:.1f}MB reserved={reserved:.1f}MB ---"
                )
            else:
                with contextlib.suppress(Exception):
                    self.model.cpu()
                print("--- CUDA ACTIVE: available=False model_device=cpu fp16=False ---")

            if self.backend in {"onnx", "tensorrt"}:
                backend_path = self.weights_path.with_suffix(f".{self.backend}")
                if backend_path.exists():
                    try:
                        self.model = YOLO(str(backend_path))
                        if self.debug:
                            print(f"--- MODEL LOAD SUCCESS: Using existing optimized backend {backend_path}")
                    except Exception as exc:
                        if self.debug:
                            print(f"--- OPTIMIZED BACKEND LOAD FAILED: {exc}. Falling back to native weights.")
                else:
                    try:
                        self.model.export(format=self.backend, imgsz=self.imgsz, simplify=True)
                        if backend_path.exists():
                            self.model = YOLO(str(backend_path))
                            if self.debug:
                                print(f"--- MODEL LOAD SUCCESS: Exported optimized backend {backend_path}")
                    except Exception as exc:
                        if self.debug:
                            print(f"--- OPTIMIZED MODEL EXPORT FAILED: {exc}. Using native weights.")

            if self.debug:
                print(f"--- MODEL LOAD SUCCESS: Loaded weights file {self.weights_path} (Device: {self.device}) ---")
            self.model_error = ""
        except Exception as exc:
            self.model = None
            self.model_error = f"Could not load YOLO weights: {exc}"
            print(f"--- MODEL LOAD CRITICAL ERROR: {exc}")

    def empty_stats(self, fps: float = 0.0) -> FrameStats:
        return FrameStats(fps=fps)

    def reset_tracking(self) -> None:
        with self._track_lock:
            self._frame_number = 0
            self._next_bottle_id = 1
            self._bottle_tracks = {}
        self._overlay_stats = None
        self._overlay_signature = None
        self._overlay_last_update = 0.0

    def _parse_inference_size(self, value: str) -> Tuple[int, int]:
        try:
            width, height = [int(part) for part in value.split("x") if part]
            if width > 0 and height > 0:
                return (width, height)
        except Exception:
            pass
        return (640, 480)

    def _select_weights_path(self) -> Path:
        backend_dir = Path(__file__).resolve().parents[1]
        if self.variant == "live":
            configured = Path(os.getenv("YOLO_LIVE_WEIGHTS", "weights/yolov8n.pt"))
            if not configured.is_absolute() and not (backend_dir / configured).exists():
                fallback = Path("weights/best_v1.pt")
                if (backend_dir / fallback).exists():
                    return fallback
            return configured
        if self.variant == "upload":
            configured = Path(os.getenv("YOLO_WEIGHTS", "weights/best.pt"))
            if not configured.is_absolute() and not (backend_dir / configured).exists():
                fallback = Path("weights/best_v1.pt")
                if (backend_dir / fallback).exists():
                    return fallback
            return configured
        return Path(os.getenv("YOLO_WEIGHTS", "weights/best_v1.pt"))

    def _run_model(self, frame_copy: np.ndarray, confidence: float, imgsz: int):
        self.last_inference_device = self.device
        self.last_inference_fp16 = self.half_precision
        results = None
        if self.use_stream:
            try:
                results = list(self.model(frame_copy, conf=confidence, imgsz=imgsz, device=self.device, half=self.half_precision, stream=True, verbose=False))
            except TypeError:
                results = None
            except Exception as exc:
                if self.debug:
                    print(f"--- STREAM MODE FALLBACK: {exc}")
                results = None

        if results is None:
            results = self.model(frame_copy, conf=confidence, imgsz=imgsz, device=self.device, half=self.half_precision, verbose=False)
        return results

    def inspect_frame(self, frame: np.ndarray) -> Tuple[np.ndarray, FrameStats]:
        started = time.perf_counter()
        if frame is None or frame.size == 0:
            return frame, self.empty_stats()
            
        if self.debug:
            print(f"--- INSPECT FRAME INCOMING: shape={frame.shape}, mean={np.mean(frame):.2f}, max={np.max(frame)} ---")
        
        if not self.ready:
            if frame.shape[1::-1] != self.inference_size:
                frame = cv2.resize(frame, self.inference_size, interpolation=cv2.INTER_LINEAR)
            frame = frame.copy()
            self._draw_status(frame, self.model_error or "Model is not available")
            return frame, self.empty_stats()

        if (
            self.variant != "live"
            and self._last_annotated is not None
            and time.perf_counter() - self._last_inference_ts < self._adaptive_delay
        ):
            cached = self._last_annotated.copy()
            return cached, self._last_stats or self.empty_stats()

        stats = None
        try:
            import torch
            with torch.no_grad():
                target_width, target_height = self.inference_size
                if frame.shape[1::-1] != (target_width, target_height):
                    frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_LINEAR)
                frame = np.ascontiguousarray(frame)
                if frame.dtype != np.uint8:
                    frame = frame.astype(np.uint8)
                inference_frame = frame.copy()

                results = self._run_model(
                    inference_frame,
                    confidence=self.confidence,
                    imgsz=min(self.imgsz, target_width),
                )
                stats = self._extract_stats(results)
        except Exception as inference_err:
            if self.debug:
                print(f"--- INFERENCE ERROR: {inference_err}. Attempting CPU fallback... ---")
            if self.device == "cuda" and not self.allow_cpu_fallback:
                self.model_error = f"CUDA inference failed without CPU fallback: {inference_err}"
                fallback_frame = frame.copy()
                self._draw_status(fallback_frame, "CUDA inference failed")
                return fallback_frame, self.empty_stats()
            try:
                import torch
                if self.device != "cpu":
                    with contextlib.suppress(Exception):
                        self.model.cpu()
                    self.device = "cpu"
                    self.half_precision = False

                target_width, target_height = self.inference_size
                if frame.shape[1::-1] != (target_width, target_height):
                    frame = cv2.resize(frame, (target_width, target_height), interpolation=cv2.INTER_LINEAR)
                frame = np.ascontiguousarray(frame)
                if frame.dtype != np.uint8:
                    frame = frame.astype(np.uint8)
                inference_frame = frame.copy()

                results = self._run_model(
                    inference_frame,
                    confidence=self.confidence,
                    imgsz=min(self.imgsz, target_width),
                )
                stats = self._extract_stats(results)
            except Exception as fallback_err:
                if self.debug:
                    print(f"--- CRITICAL INFERENCE FALLBACK FAILURE: {fallback_err} ---")
                stats = self.empty_stats()

        working_frame = frame.copy()
        annotated = self._draw_detections(working_frame, stats)
        elapsed = max(time.perf_counter() - started, 1e-6)
        fps = 1.0 / elapsed
        if self._rolling_fps <= 0.0:
            self._rolling_fps = fps
        else:
            alpha = 0.2
            self._rolling_fps = self._rolling_fps * (1.0 - alpha) + fps * alpha
        stats.fps = self._rolling_fps
        if self.draw_summary_overlay:
            self._draw_overlay(annotated, self._stable_overlay_stats(stats))

        self._last_stats = stats
        self._last_annotated = annotated.copy()
        self._last_inference_ts = time.perf_counter()
        self._last_inference_ms = elapsed * 1000.0
        self._adaptive_delay = min(1.0 / self.target_fps, max(0.02, min(0.5, self._last_inference_ms * 0.8 / 1000.0)))

        return annotated, stats

    def _stats_signature(self, stats: FrameStats) -> Tuple[int, ...]:
        return (
            stats.total_bottles,
            stats.passed,
            stats.failed,
            stats.proper_fill,
            stats.under_fill,
            stats.over_fill,
            stats.label_ok,
            stats.label_torn,
            stats.label_missing,
        )

    def _clone_stats_for_overlay(self, stats: FrameStats) -> FrameStats:
        return FrameStats(
            total_bottles=stats.total_bottles,
            passed=stats.passed,
            failed=stats.failed,
            proper_fill=stats.proper_fill,
            under_fill=stats.under_fill,
            over_fill=stats.over_fill,
            label_ok=stats.label_ok,
            label_torn=stats.label_torn,
            label_missing=stats.label_missing,
            fps=stats.fps,
            detections=[],
        )

    def _stable_overlay_stats(self, stats: FrameStats) -> FrameStats:
        now = time.perf_counter()
        signature = self._stats_signature(stats)
        should_update = (
            self._overlay_stats is None
            or signature != self._overlay_signature
            or now - self._overlay_last_update >= self._overlay_update_interval
        )
        if should_update:
            self._overlay_stats = self._clone_stats_for_overlay(stats)
            self._overlay_signature = signature
            self._overlay_last_update = now
        return self._overlay_stats

    def _extract_stats(self, results, scale_x: float = 1.0, scale_y: float = 1.0) -> FrameStats:
        counts = {name: 0 for name in CLASS_NAMES}
        detections: List[dict] = []
        if not results:
            return FrameStats()

        names = getattr(results[0], "names", {}) or {}
        if self.debug:
            print(f"--- MODEL CLASSES (NAMES): {names} ---")
        
        boxes = getattr(results[0], "boxes", None)
        if boxes is None:
            return FrameStats()

        for box in boxes:
            coords = box.xyxy[0].tolist()
            x1 = int(coords[0] * scale_x)
            y1 = int(coords[1] * scale_y)
            x2 = int(coords[2] * scale_x)
            y2 = int(coords[3] * scale_y)
            conf = float(box.conf[0].item())
            cls_id = int(box.cls[0].item())
            
            # Map raw class name from YOLO model dynamically
            raw_class_name = names.get(cls_id, "")
            if not raw_class_name and 0 <= cls_id < len(CLASS_NAMES):
                raw_class_name = CLASS_NAMES[cls_id]
                
            raw_class_name_lower = str(raw_class_name).strip().lower()
            
            # Resolve class name: Try exact match first, then alias, then fallback
            if raw_class_name_lower in CLASS_NAMES:
                class_name = raw_class_name_lower
            else:
                class_name = CLASS_ALIASES.get(raw_class_name_lower, None)
                
            # If still not found, try mapping based on common names
            if not class_name:
                for target_name in CLASS_NAMES:
                    if target_name in raw_class_name_lower:
                        class_name = target_name
                        break
                        
            # Skip if still unable to map
            if not class_name or class_name not in counts:
                if self.debug:
                    print(f"--- PARSING WARNING: Skipped unknown class name '{raw_class_name}' (ID: {cls_id})")
                continue
                
            counts[class_name] += 1
            detections.append({
                "class_name": class_name, 
                "raw_class_name": raw_class_name, 
                "confidence": round(conf, 4), 
                "box": [x1, y1, x2, y2]
            })
            
            if self.debug:
                print(f"--- DETECTION FOUND: class={class_name}, raw={raw_class_name}, conf={conf:.1%}, box={[x1, y1, x2, y2]}")

        detections = self._assign_bottle_ids(detections)
        total = counts["bottle"] or max(
            counts["proper_fill"],
            counts["under_fill"],
            counts["over_fill"],
            counts["label_ok"],
            counts["label_torn"],
            counts["label_missing"],
        )
        passed = min(counts["proper_fill"], counts["label_ok"], total)
        explicit_fail = max(
            counts["under_fill"],
            counts["over_fill"],
            counts["label_torn"],
            counts["label_missing"],
        )
        failed = max(total - passed, explicit_fail)

        return FrameStats(
            total_bottles=total,
            passed=passed,
            failed=failed,
            proper_fill=counts["proper_fill"],
            under_fill=counts["under_fill"],
            over_fill=counts["over_fill"],
            label_ok=counts["label_ok"],
            label_torn=counts["label_torn"],
            label_missing=counts["label_missing"],
            detections=detections,
        )

    def _assign_bottle_ids(self, detections: List[dict]) -> List[dict]:
        bottle_detections = [d for d in detections if d["class_name"] == "bottle"]
        if not bottle_detections:
            with self._track_lock:
                self._frame_number += 1
                self._bottle_tracks = {
                    track_id: track
                    for track_id, track in self._bottle_tracks.items()
                    if self._frame_number - track["last_seen"] <= 12
                }
            return detections

        with self._track_lock:
            self._frame_number += 1
            active_tracks = {
                track_id: track
                for track_id, track in self._bottle_tracks.items()
                if self._frame_number - track["last_seen"] <= 12
            }
            self._bottle_tracks = active_tracks
            used_tracks = set()

            for detection in sorted(bottle_detections, key=lambda item: item["box"][0]):
                x1, y1, x2, y2 = detection["box"]
                centroid = ((x1 + x2) / 2, (y1 + y2) / 2)
                width = max(x2 - x1, 1)
                height = max(y2 - y1, 1)
                distance_limit = max(80.0, math.hypot(width, height) * 0.65)
                best_track_id = None
                best_distance = float("inf")

                for track_id, track in self._bottle_tracks.items():
                    if track_id in used_tracks:
                        continue
                    distance = math.hypot(centroid[0] - track["centroid"][0], centroid[1] - track["centroid"][1])
                    if distance < best_distance and distance <= distance_limit:
                        best_distance = distance
                        best_track_id = track_id

                if best_track_id is None:
                    best_track_id = self._next_bottle_id
                    self._next_bottle_id += 1

                used_tracks.add(best_track_id)
                self._bottle_tracks[best_track_id] = {
                    "centroid": centroid,
                    "box": detection["box"],
                    "last_seen": self._frame_number,
                }
                detection["bottle_id"] = best_track_id

        return detections

    def _draw_detections(self, frame: np.ndarray, stats: FrameStats) -> np.ndarray:
        for detection in stats.detections:
            x1, y1, x2, y2 = detection["box"]
            class_name = detection["class_name"]
            confidence = detection["confidence"]
            color = DETECTION_COLORS.get(class_name, (255, 255, 255))
            
            # Show class name and confidence % (Example: proper_fill 97%)
            if class_name == "bottle" and detection.get("bottle_id"):
                label = f"Bottle #{detection['bottle_id']} {int(confidence * 100)}%"
            else:
                label = f"{class_name} {int(confidence * 100)}%"
            
            # Draw a single lightweight bounding box for real-time rendering
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2, lineType=cv2.LINE_8)

            # Render label with a compact background
            label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)[0]
            y_label = max(y1 - 5, label_size[1] + 5)
            cv2.rectangle(
                frame,
                (x1, y_label - label_size[1] - 4),
                (x1 + label_size[0] + 6, y_label + 2),
                color,
                cv2.FILLED,
            )
            cv2.putText(
                frame,
                label,
                (x1 + 2, y_label - 1),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.45,
                (255, 255, 255),
                1,
                cv2.LINE_AA,
            )
        return frame

    def _draw_overlay(self, frame: np.ndarray, stats: FrameStats) -> None:
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (12, 12), (min(360, w - 12), 92), (16, 22, 36), -1)
        lines = [
            f"FPS {stats.fps:.1f}   Total {stats.total_bottles}   PASS {stats.passed}   FAIL {stats.failed}",
            f"Fill {stats.proper_fill}/{stats.under_fill}/{stats.over_fill}   Label {stats.label_ok}/{stats.label_torn}/{stats.label_missing}",
        ]
        for index, line in enumerate(lines):
            cv2.putText(frame, line, (18, 36 + index * 26), cv2.FONT_HERSHEY_SIMPLEX, 0.52, (220, 232, 245), 1, cv2.LINE_8)

    def _draw_status(self, frame: np.ndarray, message: str) -> None:
        h, w = frame.shape[:2]
        cv2.rectangle(frame, (20, max(20, h // 2 - 35)), (w - 20, min(h - 20, h // 2 + 35)), (12, 18, 32), -1)
        cv2.putText(frame, message[:90], (34, h // 2 + 6), cv2.FONT_HERSHEY_SIMPLEX, 0.68, (80, 220, 255), 2, cv2.LINE_8)


def encode_frame(frame: np.ndarray) -> str:
    success, buffer = cv2.imencode(
        ".jpg",
        frame,
        [cv2.IMWRITE_JPEG_QUALITY, 55],
    )
    if not success:
        return ""
    return base64.b64encode(buffer).decode("utf-8")


def decode_frame(payload: str) -> np.ndarray:
    if "," in payload:
        payload = payload.split(",", 1)[1]
    data = base64.b64decode(payload)
    array = np.frombuffer(data, dtype=np.uint8)
    return cv2.imdecode(array, cv2.IMREAD_COLOR)


def merge_stats(total: dict, frame_stats: FrameStats) -> None:
    for key in [
        "total_bottles",
        "passed",
        "failed",
        "proper_fill",
        "under_fill",
        "over_fill",
        "label_ok",
        "label_torn",
        "label_missing",
    ]:
        total[key] = int(total.get(key, 0)) + int(getattr(frame_stats, key))
