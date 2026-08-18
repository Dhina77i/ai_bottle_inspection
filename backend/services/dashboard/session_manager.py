from datetime import datetime
from typing import Dict


class SessionManager:
    """Manages inspection sessions"""

    def __init__(self):
        self.sessions = {}

    def create_session(self, session_id: str) -> Dict:
        """Create new session"""
        self.sessions[session_id] = {
            "id": session_id,
            "start_time": datetime.now(),
            "status": "active",
            "frames_processed": 0,
            "detections": 0,
        }
        return self.sessions[session_id]

    def get_session(self, session_id: str) -> Dict:
        """Get session info"""
        return self.sessions.get(session_id, {})

    def end_session(self, session_id: str):
        """End session"""
        if session_id in self.sessions:
            self.sessions[session_id]["status"] = "completed"
            self.sessions[session_id]["end_time"] = datetime.now()
