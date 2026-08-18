import cv2
import numpy as np
import time
from typing import Tuple, List, Dict
from collections import defaultdict
import torch


class InferenceEngine:
    """Handles YOLO inference on frames with multi-class detection"""

    def __init__(self, model):
        self.model = model
        self.class_names = {
            0: "bottle",
            1: "fill_level",
            2: "label_good",
            3: "label_damaged",
        }
        # Ensure model is on correct device
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model.to(self.device)
        # Enable half precision if possible
        try:
            self.model.model.half()
        except Exception:
            pass

    def run_inference(self, frame: np.ndarray, conf: float = 0.35) -> dict:
        """Run inference on a single frame with resizing and GPU acceleration"""
        # Resize frame for faster inference (640x640)
        resized = cv2.resize(frame, (640, 640))
        # YOLO expects BGR numpy array; ultralytics handles device internally
        results = self.model(resized, imgsz=640, conf=conf, verbose=False)
        # Clear CUDA cache to avoid memory buildup
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        return self._parse_results(results[0])

    def _parse_results(self, result) -> dict:
        """Parse YOLO results and organize by class"""
        detections = []
        detections_by_class = defaultdict(list)
        
        if result.boxes is not None:
            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                detection = {
                    "x1": float(box.xyxy[0][0]),
                    "y1": float(box.xyxy[0][1]),
                    "x2": float(box.xyxy[0][2]),
                    "y2": float(box.xyxy[0][3]),
                    "confidence": confidence,
                    "class_id": class_id,
                    "class_name": self.class_names.get(class_id, f"class_{class_id}"),
                }
                
                detections.append(detection)
                detections_by_class[self.class_names.get(class_id, f"class_{class_id}")].append(confidence)
        
        # Calculate summary statistics
        summary = self._calculate_summary(detections_by_class)
        
        return {
            "detections": detections,
            "frame_shape": (result.orig_img.shape[0], result.orig_img.shape[1]),
            "summary": summary,
            "total_detections": len(detections),
        }

    @staticmethod
    def _calculate_summary(detections_by_class: Dict) -> Dict:
        """Calculate detection summary statistics"""
        summary = {}
        for class_name, confidences in detections_by_class.items():
            summary[class_name] = {
                "count": len(confidences),
                "avg_confidence": sum(confidences) / len(confidences) if confidences else 0,
            }
        return summary
