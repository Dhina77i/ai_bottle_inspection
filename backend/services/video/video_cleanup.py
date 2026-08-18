import os
from pathlib import Path


class VideoCleanup:
    """Handles cleanup of temporary video files"""

    @staticmethod
    def cleanup_temp_frames(temp_dir: str = "./uploads/temp_frames"):
        """Clean up temporary frame files"""
        if os.path.exists(temp_dir):
            for file in os.listdir(temp_dir):
                file_path = os.path.join(temp_dir, file)
                try:
                    if os.path.isfile(file_path):
                        os.unlink(file_path)
                except Exception as e:
                    print(f"Error deleting {file_path}: {e}")

    @staticmethod
    def cleanup_old_uploads(uploads_dir: str = "./uploads", days: int = 7):
        """Clean up old upload files"""
        pass
