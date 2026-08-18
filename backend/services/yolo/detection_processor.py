from typing import List, Dict
from collections import defaultdict


class DetectionProcessor:
    """Processes detection results and organizes by type"""

    @staticmethod
    def filter_detections(detections: List[dict], confidence_threshold: float = 0.35) -> List[dict]:
        """Filter detections by confidence"""
        return [d for d in detections if d["confidence"] >= confidence_threshold]

    @staticmethod
    def group_detections_by_class(detections: List[dict]) -> Dict[str, List[dict]]:
        """Group detections by class name"""
        grouped = defaultdict(list)
        for detection in detections:
            class_name = detection.get("class_name", f"class_{detection.get('class_id')}")
            grouped[class_name].append(detection)
        return dict(grouped)

    @staticmethod
    def get_detection_summary(detections: List[dict]) -> Dict:
        """Get summary of detections by class"""
        grouped = DetectionProcessor.group_detections_by_class(detections)
        summary = {}
        for class_name, dets in grouped.items():
            confidences = [d["confidence"] for d in dets]
            summary[class_name] = {
                "count": len(dets),
                "avg_confidence": sum(confidences) / len(confidences) if confidences else 0,
            }
        return summary

    @staticmethod
    def aggregate_detections(detections_list: List[List[dict]]) -> dict:
        """Aggregate detections across multiple frames"""
        all_detections = [d for dets in detections_list for d in dets]
        grouped = DetectionProcessor.group_detections_by_class(all_detections)
        
        summary = {}
        total_detections = len(all_detections)
        all_confidences = [d["confidence"] for d in all_detections]
        
        for class_name, dets in grouped.items():
            confidences = [d["confidence"] for d in dets]
            summary[class_name] = {
                "count": len(dets),
                "avg_confidence": sum(confidences) / len(confidences) if confidences else 0,
            }
        
        return {
            "total_detections": total_detections,
            "average_confidence": sum(all_confidences) / len(all_confidences) if all_confidences else 0,
            "by_class": summary,
        }
