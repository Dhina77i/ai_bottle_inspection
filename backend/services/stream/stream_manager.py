from typing import Dict, Optional


class StreamManager:
    """Manages stream state and operations"""

    def __init__(self):
        self.is_active = False
        self.current_source = None
        self.frame_count = 0
        self.fps = 0

    def start(self, source: str):
        """Start stream"""
        self.is_active = True
        self.current_source = source
        self.frame_count = 0

    def stop(self):
        """Stop stream"""
        self.is_active = False
        self.current_source = None

    def update_fps(self, fps: float):
        """Update FPS"""
        self.fps = fps

    def increment_frame(self):
        """Increment frame count"""
        self.frame_count += 1

    def get_status(self) -> Dict:
        """Get stream status"""
        return {
            "active": self.is_active,
            "source": self.current_source,
            "frame_count": self.frame_count,
            "fps": self.fps,
        }
