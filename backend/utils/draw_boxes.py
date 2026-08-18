import cv2
import numpy as np


class DrawBoxes:
    """Utility for drawing detection boxes with labels"""

    # Color map for different classes
    CLASS_COLORS = {
        "bottle": (0, 255, 255),           # Cyan
        "fill_level": (255, 0, 255),       # Magenta
        "label_good": (0, 255, 0),         # Green
        "label_damaged": (0, 0, 255),      # Red
    }

    @staticmethod
    def get_color(class_name: str) -> tuple:
        """Get color for a class name"""
        return DrawBoxes.CLASS_COLORS.get(class_name, (255, 255, 0))

    @staticmethod
    def draw_detection(frame: np.ndarray, detection: dict, thickness: int = 2) -> np.ndarray:
        """Draw single detection box with label and confidence"""
        x1, y1 = int(detection["x1"]), int(detection["y1"])
        x2, y2 = int(detection["x2"]), int(detection["y2"])
        confidence = detection["confidence"]
        class_name = detection.get("class_name", "unknown")

        color = DrawBoxes.get_color(class_name)

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, thickness)

        # Draw label with confidence
        label = f"{class_name} {confidence*100:.0f}%"
        label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
        
        # Background for label
        y_label = max(y1 - 10, label_size[1] + 5)
        cv2.rectangle(frame, (x1, y_label - label_size[1] - 5), 
                     (x1 + label_size[0], y_label), color, -1)
        
        # Label text
        cv2.putText(frame, label, (x1, y_label - 5), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        
        return frame

    @staticmethod
    def draw_detections(frame: np.ndarray, detections: list) -> np.ndarray:
        """Draw multiple detection boxes"""
        for detection in detections:
            frame = DrawBoxes.draw_detection(frame, detection)
        return frame

    @staticmethod
    def draw_summary(frame: np.ndarray, summary: dict, position: tuple = (10, 30)) -> np.ndarray:
        """Draw detection summary on frame"""
        y_offset = position[1]
        cv2.putText(frame, "DETECTIONS", (position[0], y_offset),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
        y_offset += 30
        
        for class_name, stats in summary.items():
            count = stats.get("count", 0)
            avg_conf = stats.get("avg_confidence", 0)
            text = f"{class_name}: {count}"
            
            # Color for class
            color = DrawBoxes.get_color(class_name)
            cv2.putText(frame, text, (position[0], y_offset),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            y_offset += 25
        
        return frame
