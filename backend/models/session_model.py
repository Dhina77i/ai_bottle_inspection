from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SessionModel(BaseModel):
    """Session data model"""
    id: str
    start_time: datetime
    end_time: Optional[datetime] = None
    status: str
    frames_processed: int
    total_detections: int
    average_confidence: float
