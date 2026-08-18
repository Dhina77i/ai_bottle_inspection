class DetectionCounter:
    """Counts and tracks detections"""

    def __init__(self):
        self.total_count = 0
        self.frame_detections = []

    def add_detection(self, detection: dict):
        """Add a detection"""
        self.total_count += 1
        self.frame_detections.append(detection)

    def get_count(self) -> int:
        """Get total detection count"""
        return self.total_count

    def reset(self):
        """Reset counter"""
        self.total_count = 0
        self.frame_detections = []
