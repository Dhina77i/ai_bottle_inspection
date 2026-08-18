import cv2


class WebcamStreamer:
    """Handles webcam streaming"""

    def __init__(self, camera_id: int = 0):
        self.camera_id = camera_id
        self.cap = None

    def open(self):
        """Open webcam"""
        self.cap = cv2.VideoCapture(self.camera_id)
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    def get_frame(self):
        """Get frame from webcam"""
        if self.cap is None:
            self.open()
        ret, frame = self.cap.read()
        return ret, frame

    def release(self):
        """Release webcam"""
        if self.cap:
            self.cap.release()

    def is_available(self) -> bool:
        """Check if webcam is available"""
        cap = cv2.VideoCapture(self.camera_id)
        ret = cap.isOpened()
        cap.release()
        return ret
