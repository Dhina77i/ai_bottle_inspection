class AnalyticsManager:
    """Manages analytics data"""

    @staticmethod
    def calculate_detection_rate(total_detections: int, total_frames: int) -> float:
        """Calculate detection rate"""
        return (total_detections / total_frames * 100) if total_frames > 0 else 0

    @staticmethod
    def calculate_average_confidence(confidences: list) -> float:
        """Calculate average confidence"""
        return sum(confidences) / len(confidences) if confidences else 0
