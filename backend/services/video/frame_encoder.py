import cv2
import numpy as np


class FrameEncoder:
    """Encodes frames to different formats"""

    @staticmethod
    def encode_jpg(frame: np.ndarray, quality: int = 80) -> bytes:
        """Encode frame as JPEG"""
        ret, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, quality])
        return buffer.tobytes() if ret else b''

    @staticmethod
    def encode_png(frame: np.ndarray) -> bytes:
        """Encode frame as PNG"""
        ret, buffer = cv2.imencode('.png', frame)
        return buffer.tobytes() if ret else b''
