from typing import Dict


class StatsManager:
    """Manages dashboard statistics"""

    def __init__(self):
        self.total_inspections = 0
        self.total_detections = 0
        self.average_confidence = 0.0
        self.detection_rate = 0.0

    def update_stats(self, detections: int, confidence: float):
        """Update statistics"""
        self.total_detections += detections
        self.total_inspections += 1
        if self.total_inspections > 0:
            self.average_confidence = self.total_detections / self.total_inspections * confidence

    def get_stats(self) -> Dict:
        """Get current statistics"""
        return {
            "total_inspections": self.total_inspections,
            "total_detections": self.total_detections,
            "average_confidence": self.average_confidence,
            "detection_rate": self.detection_rate,
        }

    def reset_stats(self):
        """Reset statistics"""
        self.total_inspections = 0
        self.total_detections = 0
        self.average_confidence = 0.0
        self.detection_rate = 0.0
