from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class Detection(BaseModel):
    """Detection data model"""
    x1: float
    y1: float
    x2: float
    y2: float
    confidence: float
    class_id: int


class InspectionModel(BaseModel):
    """Inspection data model"""
    id: Optional[str] = None
    timestamp: datetime
    video_path: str
    total_frames: int
    processed_frames: int
    detections: List[Detection]
    average_confidence: float
    status: str
