import csv
import contextlib
import os
import time
import uuid
import queue
import threading
import shutil
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from database.db import get_db
from models.inspection import Inspection
from utils.inference import BottleInspector, merge_stats


router = APIRouter()
BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"
PROCESSED_DIR = BASE_DIR / "processed"
REPORT_DIR = BASE_DIR / "reports"
for folder in (UPLOAD_DIR, PROCESSED_DIR, REPORT_DIR):
    folder.mkdir(parents=True, exist_ok=True)

analysis_inspector = BottleInspector("upload")
live_inspector = BottleInspector("live")
inspector = analysis_inspector
camera_running = False
ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv"}


class LatestAnnotatedFrame:
    def __init__(self):
        self._condition = threading.Condition()
        self._frame = None
        self._frame_id = 0
        self._updated_at = 0.0

    def clear(self):
        with self._condition:
            self._frame = None
            self._frame_id = 0
            self._updated_at = 0.0
            self._condition.notify_all()

    def publish(self, frame: np.ndarray):
        if frame is None or frame.size == 0:
            return
        with self._condition:
            self._frame = frame.copy()
            self._frame_id += 1
            self._updated_at = time.perf_counter()
            self._condition.notify_all()

    def wait_for_new(self, last_seen_id: int, timeout: float = 1.0):
        with self._condition:
            self._condition.wait_for(
                lambda: self._frame_id > last_seen_id or stream_state.stop_event.is_set(),
                timeout=timeout,
            )
            if self._frame is None or self._frame_id <= last_seen_id:
                return None, last_seen_id
            return self._frame, self._frame_id

    def latest(self):
        with self._condition:
            if self._frame is None:
                return None, self._frame_id
            return self._frame, self._frame_id


def serialize_inspection(item: Inspection) -> dict:
    return {
        "id": item.id,
        "timestamp": item.timestamp,
        "source": item.source,
        "total_bottles": item.total_bottles,
        "passed": item.passed,
        "failed": item.failed,
        "proper_fill": item.proper_fill,
        "under_fill": item.under_fill,
        "over_fill": item.over_fill,
        "label_ok": item.label_ok,
        "label_torn": item.label_torn,
        "label_missing": item.label_missing,
        "video_path": item.video_path,
        "video_name": Path(item.video_path).name if item.video_path else "Live camera",
    }


def create_inspection(db: Session, source: str, stats: dict, video_path: str | None) -> Inspection:
    item = Inspection(
        timestamp=datetime.utcnow().isoformat(timespec="seconds") + "Z",
        source=source,
        total_bottles=stats.get("total_bottles", 0),
        passed=stats.get("passed", 0),
        failed=stats.get("failed", 0),
        proper_fill=stats.get("proper_fill", 0),
        under_fill=stats.get("under_fill", 0),
        over_fill=stats.get("over_fill", 0),
        label_ok=stats.get("label_ok", 0),
        label_torn=stats.get("label_torn", 0),
        label_missing=stats.get("label_missing", 0),
        video_path=video_path,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def process_video_file(input_path: Path, processed_path: Path) -> dict:
    analysis_inspector.reset_tracking()
    cap = cv2.VideoCapture(str(input_path))
    if not cap.isOpened():
        raise ValueError("The uploaded video could not be opened.")

    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH) or 1280)
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT) or 720)
    writer = cv2.VideoWriter(str(processed_path), cv2.VideoWriter_fourcc(*"mp4v"), fps, (width, height))
    if not writer.isOpened():
        cap.release()
        raise ValueError("The processed video writer could not be initialized.")

    stride = max(int(os.getenv("FRAME_STRIDE", "12")), 1)
    max_frames = int(os.getenv("MAX_VIDEO_FRAMES", "0"))
    totals = {
        "total_bottles": 0,
        "passed": 0,
        "failed": 0,
        "proper_fill": 0,
        "under_fill": 0,
        "over_fill": 0,
        "label_ok": 0,
        "label_torn": 0,
        "label_missing": 0,
    }
    frame_index = 0
    last_annotated = None

    try:
        while True:
            ok, frame = cap.read()
            if not ok:
                break
            if max_frames and frame_index >= max_frames:
                break
            if frame_index % stride == 0:
                last_annotated, stats = inspector.inspect_frame(frame)
                merge_stats(totals, stats)
            writer.write(last_annotated if last_annotated is not None else frame)
            frame_index += 1
    finally:
        cap.release()
        writer.release()

    totals["processed_frames"] = frame_index
    return totals


@router.get("/health")
def health() -> dict:
    gpu = {"cuda_available": False, "name": None, "memory_allocated_mb": 0.0, "memory_reserved_mb": 0.0}
    try:
        import torch
        gpu["cuda_available"] = torch.cuda.is_available()
        if gpu["cuda_available"]:
            gpu["name"] = torch.cuda.get_device_name(0)
            gpu["memory_allocated_mb"] = round(torch.cuda.memory_allocated(0) / (1024 * 1024), 1)
            gpu["memory_reserved_mb"] = round(torch.cuda.memory_reserved(0) / (1024 * 1024), 1)
    except Exception:
        pass
    return {
        "ok": True,
        "model_ready": analysis_inspector.ready and live_inspector.ready,
        "model_error": analysis_inspector.model_error or live_inspector.model_error,
        "live_model_device": live_inspector.device,
        "analysis_model_device": analysis_inspector.device,
        "live_fp16": live_inspector.half_precision,
        "analysis_fp16": analysis_inspector.half_precision,
        "gpu": gpu,
    }


class StreamState:
    def __init__(self):
        self.video_path = None
        self.video_name = None
        self.stream_url = None
        self.source_type = None
        self.is_live_stream = False
        self.last_error = None
        self.is_running = False
        self.fps = 0.0
        self.inference_fps = 0.0
        self.average_inference_fps = 0.0
        self.stream_fps = 0.0
        self.capture_fps = 0.0
        self.cuda_active = False
        self.gpu_active = False
        self.model_device = "cpu"
        self.fp16_active = False
        
        # Live session statistics
        self.total_bottles = 0
        self.passed = 0
        self.failed = 0
        self.proper_fill = 0
        self.under_fill = 0
        self.over_fill = 0
        self.label_ok = 0
        self.label_torn = 0
        self.label_missing = 0
        self.capture_time_ms = 0.0
        self.inference_time_ms = 0.0
        self.encoding_time_ms = 0.0
        self.frames_dropped = 0
        self.inference_frame_count = 0
        self.stream_frame_count = 0
        self.started_at = 0.0
        self.last_inference_at = 0.0
        self.last_stream_at = 0.0
        self.last_capture_at = 0.0
        
        # Frame queue & threads
        self.raw_frame_queue = queue.Queue(maxsize=1)
        self.annotated_frames = LatestAnnotatedFrame()
        self.stop_event = threading.Event()
        self.thread = None
        self.encoder_thread = None
        self.inference_thread = None
        self.capture_thread = None
        self._lock = threading.Lock()

    def reset_stats(self):
        with self._lock:
            self.total_bottles = 0
            self.passed = 0
            self.failed = 0
            self.proper_fill = 0
            self.under_fill = 0
            self.over_fill = 0
            self.label_ok = 0
            self.label_torn = 0
            self.label_missing = 0
            self.capture_time_ms = 0.0
            self.inference_time_ms = 0.0
            self.encoding_time_ms = 0.0
            self.frames_dropped = 0
            self.inference_frame_count = 0
            self.stream_frame_count = 0
            self.started_at = time.perf_counter()
            self.last_inference_at = 0.0
            self.last_stream_at = 0.0
            self.last_capture_at = 0.0
            self.fps = 0.0
            self.inference_fps = 0.0
            self.average_inference_fps = 0.0
            self.stream_fps = 0.0
            self.capture_fps = 0.0
            self.last_error = None

    def stop(self):
        self.stop_event.set()
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=1.5)
        if self.capture_thread and self.capture_thread.is_alive():
            self.capture_thread.join(timeout=1.5)
        if self.inference_thread and self.inference_thread.is_alive():
            self.inference_thread.join(timeout=1.5)
        if self.encoder_thread and self.encoder_thread.is_alive():
            self.encoder_thread.join(timeout=1.5)
        self.is_running = False
        self.stop_event.clear()

    def clear(self):
        self.stop()
        self.video_path = None
        self.video_name = None
        self.stream_url = None
        self.source_type = None
        self.is_live_stream = False
        self.last_error = None
        self.thread = None
        self.encoder_thread = None
        self.inference_thread = None
        self.capture_thread = None
        self.reset_stats()
        self.annotated_frames.clear()
        while not self.raw_frame_queue.empty():
            try:
                self.raw_frame_queue.get_nowait()
            except queue.Empty:
                break

    def put_latest(self, target_queue: queue.Queue, item):
        try:
            if target_queue.full():
                with contextlib.suppress(queue.Empty):
                    target_queue.get_nowait()
                self.frames_dropped += 1
            target_queue.put_nowait(item)
        except Exception:
            pass

    def publish_annotated(self, frame: np.ndarray):
        self.annotated_frames.publish(frame)

    def mark_capture_frame(self):
        now = time.perf_counter()
        with self._lock:
            if self.last_capture_at:
                instantaneous = 1.0 / max(now - self.last_capture_at, 1e-6)
                self.capture_fps = instantaneous if self.capture_fps <= 0 else self.capture_fps * 0.85 + instantaneous * 0.15
            self.last_capture_at = now

    def mark_inference_frame(self, fps_sample: float | None = None):
        now = time.perf_counter()
        with self._lock:
            if self.last_inference_at:
                instantaneous = 1.0 / max(now - self.last_inference_at, 1e-6)
            else:
                instantaneous = fps_sample or 0.0
            self.last_inference_at = now
            self.inference_frame_count += 1
            elapsed = max(now - self.started_at, 1e-6)
            self.average_inference_fps = self.inference_frame_count / elapsed
            self.inference_fps = (
                instantaneous
                if self.inference_fps <= 0
                else self.inference_fps * 0.75 + instantaneous * 0.25
            )
            self.fps = self.inference_fps

    def mark_stream_frame(self):
        now = time.perf_counter()
        with self._lock:
            if self.last_stream_at:
                instantaneous = 1.0 / max(now - self.last_stream_at, 1e-6)
                self.stream_fps = instantaneous if self.stream_fps <= 0 else self.stream_fps * 0.80 + instantaneous * 0.20
            self.last_stream_at = now
            self.stream_frame_count += 1

stream_state = StreamState()


def _append_rtsp_transport(stream_url: str, transport: str) -> str:
    if "?" in stream_url:
        return f"{stream_url}&rtsp_transport={transport}"
    return f"{stream_url}?rtsp_transport={transport}"


def _open_stream_capture(stream_url: str, source_type: str | None = None):
    flags = cv2.CAP_FFMPEG if hasattr(cv2, "CAP_FFMPEG") else 0
    if source_type == "webcam" or (isinstance(stream_url, str) and stream_url.isdigit()):
        camera_id = int(stream_url)
        cap = cv2.VideoCapture(camera_id, cv2.CAP_DSHOW if hasattr(cv2, "CAP_DSHOW") else 0)
        with contextlib.suppress(Exception):
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            cap.set(cv2.CAP_PROP_FPS, 30)
        start = time.time()
        while not cap.isOpened() and time.time() - start < 6:
            time.sleep(0.2)
            if stream_state.stop_event.is_set():
                break
        if cap.isOpened():
            return cap
        with contextlib.suppress(Exception):
            cap.release()
        return None

    candidates = [stream_url]
    if stream_url.startswith("rtsp://"):
        os.environ.setdefault(
            "OPENCV_FFMPEG_CAPTURE_OPTIONS",
            "rtsp_transport;tcp|fflags;nobuffer|flags;low_delay|max_delay;500000|stimeout;5000000",
        )
        candidates.append(_append_rtsp_transport(stream_url, "tcp"))
        candidates.append(_append_rtsp_transport(stream_url, "udp"))
    for url in candidates:
        cap = cv2.VideoCapture(url, flags)
        with contextlib.suppress(Exception):
            cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
            cap.set(cv2.CAP_PROP_FPS, 30)
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        start = time.time()
        while not cap.isOpened() and time.time() - start < 6:
            time.sleep(0.2)
            if not cap.isOpened() and stream_state.stop_event.is_set():
                break
        if cap.isOpened():
            return cap
        with contextlib.suppress(Exception):
            cap.release()
    return None


def run_video_inference():
    global stream_state
    
    stream_state.reset_stats()
    stream_state.is_running = True
    stream_state.stop_event.clear()
    
    import torch
    stream_state.cuda_active = torch.cuda.is_available()
    stream_state.gpu_active = torch.cuda.is_available() and analysis_inspector.device == "cuda"
    stream_state.model_device = analysis_inspector.device
    stream_state.fp16_active = analysis_inspector.half_precision
    
    try:
        analysis_inspector.reset_tracking()
        cap = cv2.VideoCapture(stream_state.video_path)
        if not cap.isOpened():
            stream_state.is_running = False
            return
            
        fps_target = cap.get(cv2.CAP_PROP_FPS) or 30.0
        if fps_target <= 0 or fps_target > 120:
            fps_target = 30.0
            
        frame_time = 1.0 / fps_target
        
        while not stream_state.stop_event.is_set():
            t_start = time.perf_counter()
            
            ret, frame = cap.read()
            if not ret:
                break
                
            annotated_frame, stats = analysis_inspector.inspect_frame(frame)
            stream_state.cuda_active = torch.cuda.is_available()
            stream_state.gpu_active = analysis_inspector.last_inference_device == "cuda"
            stream_state.model_device = analysis_inspector.last_inference_device
            stream_state.fp16_active = analysis_inspector.last_inference_fp16
            
            with stream_state._lock:
                stream_state.total_bottles = stats.total_bottles
                stream_state.passed = stats.passed
                stream_state.failed = stats.failed
                stream_state.proper_fill = stats.proper_fill
                stream_state.under_fill = stats.under_fill
                stream_state.over_fill = stats.over_fill
                stream_state.label_ok = stats.label_ok
                stream_state.label_torn = stats.label_torn
                stream_state.label_missing = stats.label_missing
            stream_state.mark_inference_frame(stats.fps)
            stream_state.publish_annotated(annotated_frame)
                
            elapsed = time.perf_counter() - t_start
            sleep_time = frame_time - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
                
        cap.release()
        
        # Save results at completion of video
        if stream_state.total_bottles > 0 and not stream_state.stop_event.is_set():
            db = next(get_db())
            try:
                stats_dict = {
                    "total_bottles": stream_state.total_bottles,
                    "passed": stream_state.passed,
                    "failed": stream_state.failed,
                    "proper_fill": stream_state.proper_fill,
                    "under_fill": stream_state.under_fill,
                    "over_fill": stream_state.over_fill,
                    "label_ok": stream_state.label_ok,
                    "label_torn": stream_state.label_torn,
                    "label_missing": stream_state.label_missing,
                }
                create_inspection(db, "upload", stats_dict, stream_state.video_path)
            except Exception as db_err:
                print(f"Error saving to DB on completion: {db_err}")
            finally:
                db.close()
                
    except Exception as e:
        print(f"Error in video inference thread: {e}")
    finally:
        stream_state.is_running = False


def run_live_stream_capture():
    global stream_state
    stream_url = stream_state.stream_url or stream_state.video_path
    retry_delay = 1.5
    reconnect_attempts = 0
    max_reconnects = 8
    cap = None

    while not stream_state.stop_event.is_set():
        if cap is None or not cap.isOpened():
            if cap:
                cap.release()
            cap = _open_stream_capture(stream_url, stream_state.source_type)
            if not cap or not cap.isOpened():
                reconnect_attempts += 1
                stream_state.last_error = f"Unable to open stream. Retry {reconnect_attempts}/{max_reconnects}."
                if reconnect_attempts >= max_reconnects:
                    print(f"[STREAM] Failed to open capture after {max_reconnects} attempts for source_type={stream_state.source_type} url={stream_url}")
                    time.sleep(retry_delay * 2)
                    reconnect_attempts = 0
                else:
                    time.sleep(retry_delay)
                continue

            reconnect_attempts = 0
            stream_state.last_error = None
            print(f"[STREAM] Capture opened successfully for source_type={stream_state.source_type} url={stream_url}")
            try:
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                cap.set(cv2.CAP_PROP_FPS, 30)
                cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
            except Exception:
                pass

        capture_start = time.perf_counter()
        ret, frame = cap.read()
        capture_end = time.perf_counter()
        stream_state.capture_time_ms = (capture_end - capture_start) * 1000.0
        if stream_state.capture_time_ms > 3000 and stream_state.source_type != "webcam":
            stream_state.last_error = "Stream read timeout, reconnecting..."
            with contextlib.suppress(Exception):
                cap.release()
            cap = None
            continue

        if not ret or frame is None or frame.size == 0:
            reconnect_attempts += 1
            stream_state.last_error = f"Stream disconnected, reconnecting... ({reconnect_attempts})"
            if reconnect_attempts >= max_reconnects:
                time.sleep(retry_delay)
                reconnect_attempts = 0
            continue

        reconnect_attempts = 0
        stream_state.mark_capture_frame()
        stream_state.put_latest(stream_state.raw_frame_queue, frame)

        time.sleep(0.001)

    if cap:
        cap.release()


def run_live_stream_inference():
    global stream_state
    stream_state.reset_stats()
    stream_state.is_running = True
    stream_state.stop_event.clear()
    stream_state.last_error = None

    import torch
    stream_state.cuda_active = torch.cuda.is_available()
    stream_state.gpu_active = torch.cuda.is_available() and live_inspector.device == "cuda"
    stream_state.model_device = live_inspector.device
    stream_state.fp16_active = live_inspector.half_precision

    live_inspector.reset_tracking()
    try:
        while not stream_state.stop_event.is_set():
            try:
                frame = stream_state.raw_frame_queue.get(timeout=0.15)
            except queue.Empty:
                continue

            if frame is None or frame.size == 0:
                continue

            inference_start = time.perf_counter()
            annotated_frame, stats = live_inspector.inspect_frame(frame)
            inference_end = time.perf_counter()
            stream_state.inference_time_ms = (inference_end - inference_start) * 1000.0
            stream_state.cuda_active = torch.cuda.is_available()
            stream_state.gpu_active = live_inspector.last_inference_device == "cuda"
            stream_state.model_device = live_inspector.last_inference_device
            stream_state.fp16_active = live_inspector.last_inference_fp16
            stream_state.mark_inference_frame(stats.fps)

            with stream_state._lock:
                stream_state.total_bottles = stats.total_bottles
                stream_state.passed = stats.passed
                stream_state.failed = stats.failed
                stream_state.proper_fill = stats.proper_fill
                stream_state.under_fill = stats.under_fill
                stream_state.over_fill = stats.over_fill
                stream_state.label_ok = stats.label_ok
                stream_state.label_torn = stats.label_torn
                stream_state.label_missing = stats.label_missing

            stream_state.publish_annotated(annotated_frame)
    except Exception as exc:
        stream_state.last_error = str(exc)
        print(f"Error in live stream inference thread: {exc}")
    finally:
        stream_state.is_running = False


current_video_path = None


@router.post("/upload-video")
async def upload_video(file: UploadFile = File(...)):
    global current_video_path
    
    # Target directory inside backend/uploads/input_videos/
    upload_dir = BASE_DIR / "uploads" / "input_videos"
    upload_dir.mkdir(parents=True, exist_ok=True)
    
    file_path = upload_dir / file.filename
    
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save video: {e}")
        
    current_video_path = str(file_path)
    stream_state.clear()
    stream_state.video_path = str(file_path)
    stream_state.video_name = file.filename
    
    return {
        "message": "Video uploaded successfully.",
        "video_path": str(file_path),
        "video_name": file.filename,
    }


@router.post("/start-inference")
def start_inference():
    global stream_state, current_video_path
    if not current_video_path:
        raise HTTPException(status_code=400, detail="No video uploaded. Upload a video first.")
        
    if stream_state.is_running:
        stream_state.stop()
        
    stream_state.annotated_frames.clear()
            
    stream_state.video_path = current_video_path
    stream_state.thread = threading.Thread(target=run_video_inference, daemon=True)
    stream_state.thread.start()
    
    # Wait briefly for thread start
    time.sleep(0.1)
    
    return {"message": "Inference started successfully."}


@router.get("/video-feed")
def video_feed():
    def generate_frames():
        last_seen_id = 0
        last_emit_at = 0.0
        target_stream_fps = float(os.getenv("MJPEG_TARGET_FPS", "35"))
        min_interval = 1.0 / max(min(target_stream_fps, 60.0), 1.0)
        while True:
            try:
                annotated_frame, frame_id = stream_state.annotated_frames.wait_for_new(last_seen_id, timeout=0.2)
                if annotated_frame is None:
                    annotated_frame, frame_id = stream_state.annotated_frames.latest()

                if annotated_frame is None:
                    if not stream_state.is_running:
                        break
                    continue

                wait_time = min_interval - (time.perf_counter() - last_emit_at)
                if wait_time > 0:
                    time.sleep(wait_time)

                last_seen_id = frame_id
                last_emit_at = time.perf_counter()
                stream_state.mark_stream_frame()

                if annotated_frame is None:
                    break
                
                if not isinstance(annotated_frame, np.ndarray) or annotated_frame.size == 0:
                    continue
                    
                encode_start = time.perf_counter()
                success, buffer = cv2.imencode(
                    '.jpg',
                    annotated_frame,
                    [cv2.IMWRITE_JPEG_QUALITY, 55]
                )
                encode_end = time.perf_counter()
                stream_state.encoding_time_ms = (encode_end - encode_start) * 1000.0
                if not success or buffer is None:
                    continue
                
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + buffer.tobytes() + b"\r\n"
                )
            except queue.Empty:
                if not stream_state.is_running:
                    break
                continue
            except Exception as stream_err:
                print(f"--- STREAM GENERATOR ERROR: {stream_err}")
                if not stream_state.is_running:
                    break
                continue
                
    return StreamingResponse(
        generate_frames(), 
        media_type='multipart/x-mixed-replace; boundary=frame'
    )


@router.get("/video-feed-stats")
def video_feed_stats():
    return {
        "is_running": stream_state.is_running,
        "fps": round(stream_state.inference_fps, 1),
        "inference_fps": round(stream_state.inference_fps, 1),
        "stream_fps": round(stream_state.stream_fps, 1),
        "capture_fps": round(stream_state.capture_fps, 1),
        "average_fps": round(stream_state.average_inference_fps, 1),
        "average_inference_fps": round(stream_state.average_inference_fps, 1),
        "capture_time_ms": round(stream_state.capture_time_ms, 1),
        "inference_time_ms": round(stream_state.inference_time_ms, 1),
        "encoding_time_ms": round(stream_state.encoding_time_ms, 1),
        "frames_dropped": stream_state.frames_dropped,
        "cuda_active": stream_state.cuda_active,
        "gpu_active": stream_state.gpu_active,
        "model_device": stream_state.model_device,
        "fp16_active": stream_state.fp16_active,
        "stats": {
            "total_bottles": stream_state.total_bottles,
            "passed": stream_state.passed,
            "failed": stream_state.failed,
            "proper_fill": stream_state.proper_fill,
            "under_fill": stream_state.under_fill,
            "over_fill": stream_state.over_fill,
            "label_ok": stream_state.label_ok,
            "label_torn": stream_state.label_torn,
            "label_missing": stream_state.label_missing,
        }
    }


@router.post("/stop-inference")
def stop_inference(db: Session = Depends(get_db)):
    global stream_state
    stream_state.stop()
    
    # Save the current stats to DB if there were detections
    if stream_state.total_bottles > 0 and not stream_state.is_live_stream:
        try:
            stats_dict = {
                "total_bottles": stream_state.total_bottles,
                "passed": stream_state.passed,
                "failed": stream_state.failed,
                "proper_fill": stream_state.proper_fill,
                "under_fill": stream_state.under_fill,
                "over_fill": stream_state.over_fill,
                "label_ok": stream_state.label_ok,
                "label_torn": stream_state.label_torn,
                "label_missing": stream_state.label_missing,
            }
            create_inspection(db, "upload", stats_dict, stream_state.video_path)
        except Exception as db_err:
            print(f"Error saving to DB on stop: {db_err}")
            
    return {"message": "Inference stopped successfully."}


@router.post("/start-stream")
def start_stream(payload: dict):
    global stream_state
    source_type = payload.get("source_type")
    stream_url = payload.get("url")

    if source_type not in {"rtsp", "ip_webcam", "webcam"}:
        raise HTTPException(status_code=400, detail="Invalid source type. Use 'webcam', 'rtsp' or 'ip_webcam'.")
    if not stream_url and source_type != "webcam":
        raise HTTPException(status_code=400, detail="Stream URL is required.")

    print(f"[STREAM] Starting live stream: source_type={source_type}, stream_url={stream_url}")
    stream_state.stop()
    stream_state.clear()
    stream_state.video_path = stream_url
    stream_state.stream_url = stream_url
    stream_state.source_type = source_type
    stream_state.is_live_stream = True
    stream_state.stop_event.clear()
    stream_state.is_running = True
    stream_state.capture_thread = threading.Thread(target=run_live_stream_capture, daemon=True)
    stream_state.inference_thread = threading.Thread(target=run_live_stream_inference, daemon=True)
    stream_state.capture_thread.start()
    stream_state.inference_thread.start()

    return {"message": "Stream started successfully.", "stream_url": stream_url, "source_type": source_type}


@router.get("/stop-stream")
def stop_stream():
    global stream_state
    stream_state.stop()
    stream_state.clear()
    return {"message": "Stream stopped successfully."}


@router.get("/stream-status")
def stream_status():
    return {
        "is_running": stream_state.is_running,
        "source_type": stream_state.source_type,
        "stream_url": stream_state.stream_url,
        "last_error": stream_state.last_error,
        "stats": {
            "total_bottles": stream_state.total_bottles,
            "passed": stream_state.passed,
            "failed": stream_state.failed,
            "proper_fill": stream_state.proper_fill,
            "under_fill": stream_state.under_fill,
            "over_fill": stream_state.over_fill,
            "label_ok": stream_state.label_ok,
            "label_torn": stream_state.label_torn,
            "label_missing": stream_state.label_missing,
        },
        "fps": round(stream_state.inference_fps, 1),
        "inference_fps": round(stream_state.inference_fps, 1),
        "stream_fps": round(stream_state.stream_fps, 1),
        "capture_fps": round(stream_state.capture_fps, 1),
        "average_fps": round(stream_state.average_inference_fps, 1),
        "average_inference_fps": round(stream_state.average_inference_fps, 1),
        "capture_time_ms": round(stream_state.capture_time_ms, 1),
        "inference_time_ms": round(stream_state.inference_time_ms, 1),
        "encoding_time_ms": round(stream_state.encoding_time_ms, 1),
        "frames_dropped": stream_state.frames_dropped,
        "cuda_active": stream_state.cuda_active,
        "gpu_active": stream_state.gpu_active,
        "model_device": stream_state.model_device,
        "fp16_active": stream_state.fp16_active,
    }


@router.post("/clear-dashboard")
def clear_dashboard():
    global stream_state
    stream_state.clear()
    return {"message": "Dashboard cleared successfully."}


@router.delete("/api/analytics/clear")
def clear_analytics_endpoint(db: Session = Depends(get_db)):
    """Clear stored analytics data (safe, deletes all inspections)."""
    try:
        deleted = db.query(Inspection).delete(synchronize_session=False)
        db.commit()
        return {"success": True, "deleted": deleted}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/start-camera")
def start_camera() -> dict:
    global camera_running
    camera_running = True
    return {"running": camera_running, "model_ready": inspector.ready, "model_error": inspector.model_error}


@router.get("/stop-camera")
def stop_camera(db: Session = Depends(get_db)) -> dict:
    global camera_running
    camera_running = False
    return {"running": camera_running}


@router.get("/analytics")
def analytics(db: Session = Depends(get_db)) -> dict:
    fields = [
        "total_bottles",
        "passed",
        "failed",
        "proper_fill",
        "under_fill",
        "over_fill",
        "label_ok",
        "label_torn",
        "label_missing",
    ]
    totals = {field: int(db.query(func.coalesce(func.sum(getattr(Inspection, field)), 0)).scalar() or 0) for field in fields}
    recent = db.query(Inspection).order_by(desc(Inspection.id)).limit(14).all()
    trend = [
        {
            "name": datetime.fromisoformat(item.timestamp.replace("Z", "")).strftime("%m/%d %H:%M"),
            "passed": item.passed,
            "failed": item.failed,
            "total": item.total_bottles,
        }
        for item in reversed(recent)
    ]
    return {
        "totals": totals,
        "pass_fail": [{"name": "Passed", "value": totals["passed"]}, {"name": "Failed", "value": totals["failed"]}],
        "defects": [
            {"name": "Under fill", "value": totals["under_fill"]},
            {"name": "Over fill", "value": totals["over_fill"]},
            {"name": "Torn label", "value": totals["label_torn"]},
            {"name": "Missing label", "value": totals["label_missing"]},
        ],
        "trend": trend,
        "model_ready": inspector.ready,
        "model_error": inspector.model_error,
    }


@router.get("/history")
def history(search: str = "", source: str = "", page: int = 1, page_size: int = 10, db: Session = Depends(get_db)) -> dict:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 100)
    query = db.query(Inspection)
    if source:
        query = query.filter(Inspection.source == source)
    if search:
        query = query.filter(Inspection.video_path.like(f"%{search}%"))
    total = query.count()
    rows = query.order_by(desc(Inspection.id)).offset((page - 1) * page_size).limit(page_size).all()
    return {"items": [serialize_inspection(item) for item in rows], "total": total, "page": page, "page_size": page_size}


@router.get("/history/{inspection_id}/report")
def download_report(inspection_id: int, db: Session = Depends(get_db)):
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found.")

    path = REPORT_DIR / f"inspection_{inspection_id}.csv"

    try:
        # If file does not exist, generate it atomically
        if not path.exists():
            temp_path = REPORT_DIR / f".{path.name}.tmp"
            with temp_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.writer(handle)
                writer.writerow(["field", "value"])
                for key, value in serialize_inspection(item).items():
                    writer.writerow([key, value])
            # Ensure file is writable/readable and then move into place
            try:
                os.chmod(temp_path, 0o644)
            except Exception:
                pass
            temp_path.replace(path)

        if not path.exists():
            raise HTTPException(status_code=500, detail="Report file could not be created.")

        # Return with explicit headers to ensure browser downloads correctly
        headers = {"Content-Disposition": f'attachment; filename="{path.name}"'}
        return FileResponse(path, media_type="text/csv", headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        # Log error for debugging without exposing internals to client
        try:
            # use backend logger if available
            import logging
            logging.getLogger("backend").exception("Failed to generate or return report %s: %s", path, e)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="Failed to prepare report file.")


@router.get("/export-csv")
def export_csv(db: Session = Depends(get_db)):
    rows = db.query(Inspection).order_by(desc(Inspection.id)).all()

    def generate():
        header = [
            "id",
            "timestamp",
            "source",
            "total_bottles",
            "passed",
            "failed",
            "proper_fill",
            "under_fill",
            "over_fill",
            "label_ok",
            "label_torn",
            "label_missing",
            "video_path",
        ]
        yield ",".join(header) + "\n"
        for row in rows:
            values = [str(getattr(row, column) or "") for column in header]
            yield ",".join(value.replace(",", " ") for value in values) + "\n"

    return StreamingResponse(generate(), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=inspections.csv"})


@router.get("/processed/{filename}")
def processed_video(filename: str):
    path = PROCESSED_DIR / filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Processed video not found.")
    return FileResponse(path, media_type="video/mp4", filename=filename)
