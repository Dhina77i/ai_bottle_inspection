import cv2
import numpy as np


class FrameProcessor:
    """Processes video frames"""

    @staticmethod
    def resize_frame(frame: np.ndarray, width: int = 640, height: int = 480) -> np.ndarray:
        """Resize frame"""
        return cv2.resize(frame, (width, height))

    @staticmethod
    def normalize_frame(frame: np.ndarray) -> np.ndarray:
        """Normalize frame"""
        return frame / 255.0

    @staticmethod
    def apply_preprocessing(frame: np.ndarray) -> np.ndarray:
        """Apply preprocessing to frame"""
        return cv2.GaussianBlur(frame, (5, 5), 0)
