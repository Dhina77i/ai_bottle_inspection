import cv2
from pathlib import Path


class VideoReader:
    """Reads video frames"""

    def __init__(self, video_path: str):
        self.video_path = video_path
        self.cap = cv2.VideoCapture(video_path)

    def read_frame(self):
        """Read next frame"""
        ret, frame = self.cap.read()
        return ret, frame

    def get_properties(self) -> dict:
        """Get video properties"""
        return {
            "fps": self.cap.get(cv2.CAP_PROP_FPS),
            "frame_count": int(self.cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "width": int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        }

    def seek_frame(self, frame_number: int):
        """Seek to specific frame"""
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)

    def release(self):
        """Release video"""
        self.cap.release()
