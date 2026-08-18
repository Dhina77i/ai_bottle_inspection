import time


class FPSCounter:
    """Counts frames per second"""

    def __init__(self):
        self.start_time = time.time()
        self.frame_count = 0
        self.fps = 0

    def update(self):
        """Update frame count and calculate FPS"""
        self.frame_count += 1
        elapsed = time.time() - self.start_time
        if elapsed >= 1.0:
            self.fps = self.frame_count / elapsed
            self.frame_count = 0
            self.start_time = time.time()

    def get_fps(self) -> float:
        """Get current FPS"""
        return self.fps
