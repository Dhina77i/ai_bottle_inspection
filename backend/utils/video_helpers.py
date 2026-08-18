import cv2


class VideoHelpers:
    """Helper functions for video operations"""

    @staticmethod
    def get_video_properties(video_path: str) -> dict:
        """Get video file properties"""
        cap = cv2.VideoCapture(video_path)
        props = {
            "fps": cap.get(cv2.CAP_PROP_FPS),
            "frame_count": int(cap.get(cv2.CAP_PROP_FRAME_COUNT)),
            "width": int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            "height": int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)),
        }
        cap.release()
        return props

    @staticmethod
    def get_frame_stride(total_frames: int, max_frames: int = 0) -> int:
        """Calculate frame stride for efficient processing"""
        if max_frames <= 0:
            return 1
        stride = max(1, total_frames // max_frames)
        return stride
