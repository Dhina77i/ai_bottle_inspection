import cv2
from typing import Generator


class MJPEGStream:
    """MJPEG stream handler"""

    @staticmethod
    def frame_generator(frame_queue) -> Generator:
        """Generate MJPEG stream"""
        while True:
            frame = frame_queue.get()
            if frame is None:
                break
            _, buffer = cv2.imencode('.jpg', frame)
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n'
                   b'Content-Length: ' + str(len(frame_bytes)).encode() + b'\r\n\r\n'
                   + frame_bytes + b'\r\n')
