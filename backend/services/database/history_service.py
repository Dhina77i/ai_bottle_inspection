class HistoryService:
    """Handles inspection history"""

    @staticmethod
    def get_history(skip: int = 0, limit: int = 10):
        """Get inspection history"""
        return {"items": [], "total": 0}

    @staticmethod
    def get_by_id(inspection_id: str):
        """Get inspection by ID"""
        return {}

    @staticmethod
    def delete(inspection_id: str):
        """Delete inspection"""
        pass
