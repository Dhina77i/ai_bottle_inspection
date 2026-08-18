import cv2
from pathlib import Path


class VideoStreamer:
    """Handles video file streaming"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = None

    def open(self):
        """Open video file"""
        if not Path(self.video_path).exists():
            raise FileNotFoundError(f"Video file not found: {self.video_path}")
        self.cap = cv2.VideoCapture(self.video_path)

    def get_frame(self):
        """Get next frame from video"""
        if self.cap is None:
            self.open()
        ret, frame = self.cap.read()
        return ret, frame

    def release(self):
        """Release video file"""
        if self.cap:
            self.cap.release()

    def get_fps(self) -> float:
        """Get video FPS"""
        return self.cap.get(cv2.CAP_PROP_FPS) if self.cap else 0

    def get_frame_count(self) -> int:
        """Get total frame count"""
        return int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT)) if self.cap else 0
