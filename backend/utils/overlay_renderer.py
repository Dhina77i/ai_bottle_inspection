import cv2
import numpy as np


class OverlayRenderer:
    """Renders overlay information on frames"""

    @staticmethod
    def render_fps(frame: np.ndarray, fps: float, position: tuple = (10, 30)):
        """Render FPS on frame"""
        cv2.putText(frame, f"FPS: {fps:.1f}", position, cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return frame

    @staticmethod
    def render_detection_count(frame: np.ndarray, count: int, position: tuple = (10, 70)):
        """Render detection count on frame"""
        cv2.putText(frame, f"Detections: {count}", position, cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        return frame

    @staticmethod
    def render_info(frame: np.ndarray, info: dict):
        """Render multiple info items on frame"""
        y_position = 30
        for key, value in info.items():
            text = f"{key}: {value}"
            cv2.putText(frame, text, (10, y_position), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 1)
            y_position += 25
        return frame
