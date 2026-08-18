from ultralytics import YOLO
import os
from pathlib import Path
import torch


class ModelLoader:
    """Handles YOLO model loading and caching"""

    _model = None

    @classmethod
    def get_model(cls, weights_path: str = "weights/best.pt"):
        """Load or get cached YOLO model"""
        if cls._model is None:
            if not os.path.exists(weights_path):
                raise FileNotFoundError(f"Model weights not found at {weights_path}")
            cls._model = YOLO(weights_path)
        return cls._model

    @classmethod
    def reload_model(cls, weights_path: str = "weights/best.pt"):
        """Force reload the model"""
        cls._model = YOLO(weights_path)
        return cls._model
