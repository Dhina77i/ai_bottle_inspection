from .websocket_manager import WebSocketManager


class StatsBroadcaster:
    """Broadcasts statistics to WebSocket clients"""

    def __init__(self, ws_manager: WebSocketManager):
        self.ws_manager = ws_manager

    async def broadcast_frame_stats(self, frame_number: int, detections: int, fps: float):
        """Broadcast frame statistics"""
        message = {
            "type": "frame_stats",
            "frame_number": frame_number,
            "detections": detections,
            "fps": fps,
        }
        await self.ws_manager.broadcast(message)

    async def broadcast_session_stats(self, session_stats: dict):
        """Broadcast session statistics"""
        message = {"type": "session_stats", "data": session_stats}
        await self.ws_manager.broadcast(message)
