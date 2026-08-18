from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import queue, threading, cv2, time
from services.yolo.model_loader import ModelLoader
from services.yolo.inference_engine import InferenceEngine
from utils.draw_boxes import DrawBoxes
from services.yolo.detection_processor import DetectionProcessor
from utils.logger import logger
from services.stream.mjpeg_stream import MJPEGStream
from services.stream.session_store import session_results

router = APIRouter(prefix="/api/stream", tags=["stream"])

TARGET_FPS = 30  # Desired streaming FPS
MAX_QUEUE_SIZE = 5  # Limit queue size to avoid memory bloat

@router.get("/video-feed/{session_id}")
async def video_feed(session_id: str, background_tasks: BackgroundTasks):
    """Stream processed video frames as MJPEG for a given session"""
    if session_id not in session_results:
        raise HTTPException(status_code=404, detail="Session not found")
    q = session_results[session_id].get("queue")
    if q is None:
        raise HTTPException(status_code=500, detail="Queue not initialized for session")
    return StreamingResponse(MJPEGStream.frame_generator(q), media_type="multipart/x-mixed-replace; boundary=frame")

def _process_and_queue(session_id: str, video_path: str, q: queue.Queue):
    try:
        model = ModelLoader.get_model()
        engine = InferenceEngine(model)
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            logger.error(f"Cannot open video for session {session_id}")
            return
        frame_idx = 0
        all_detections = []
        last_frame_time = time.time()
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            now = time.time()
            elapsed = now - last_frame_time
            if elapsed < 1.0 / TARGET_FPS:
                continue
            last_frame_time = now
            resized = cv2.resize(frame, (640, 640))
            result = engine.run_inference(resized, conf=0.35)
            detections = result.get("detections", [])
            all_detections.extend(detections)
            display_frame = DrawBoxes.draw_detections(frame, detections)
            try:
                q.put_nowait(display_frame)
            except queue.Full:
                logger.warning(f"Queue full for session {session_id}, dropping frame")
            frame_idx += 1
            summary = DetectionProcessor.get_detection_summary(all_detections)
            session_results[session_id].update({
                "status": "processing",
                "processed_frames": frame_idx,
                "total_detections": len(all_detections),
                "summary": summary,
            })
        cap.release()
        session_results[session_id]["status"] = "completed"
        q.put(None)
    except Exception as e:
        logger.error(f"Streaming error for session {session_id}: {e}")
        session_results[session_id] = {"status": "error", "error": str(e)}
        q.put(None)
