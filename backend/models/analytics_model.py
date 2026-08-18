from pydantic import BaseModel


class AnalyticsModel(BaseModel):
    """Analytics data model"""
    total_inspections: int
    total_detections: int
    average_confidence: float
    detection_rate: float
    total_processing_time: float
