from fastapi import APIRouter, File, UploadFile, HTTPException, BackgroundTasks
import shutil, uuid
from pathlib import Path
from utils.logger import logger
from services.stream.session_store import session_results
from routes.stream_routes import _process_and_queue
import threading, queue

router = APIRouter(prefix="/api/inference", tags=["inference"])

UPLOAD_DIR = Path("./uploads/input_videos")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.post("/upload")
async def upload_video(file: UploadFile = File(...), background_tasks: BackgroundTasks = None):
    """Upload a video file and start real‑time YOLO inference"""
    try:
        session_id = str(uuid.uuid4())
        file_path = UPLOAD_DIR / file.filename
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        logger.info(f"Video uploaded: {file.filename} (session {session_id})")
        # Store initial session info
        session_results[session_id] = {
            "status": "queued",
            "video_path": str(file_path),
            "processed_frames": 0,
            "total_detections": 0,
            "summary": {},
        }
        # Launch processing in a background thread (non‑blocking)
        q: queue.Queue = queue.Queue(maxsize=10)
        thread = threading.Thread(target=_process_and_queue, args=(session_id, str(file_path), q), daemon=True)
        thread.start()
        # Attach the queue to session for the streaming endpoint to consume
        session_results[session_id]["queue"] = q
        return {"message": "File uploaded and processing started", "session_id": session_id, "filename": file.filename}
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/results/{session_id}")
async def get_inference_results(session_id: str):
    """Get inference results for a session"""
    if session_id not in session_results:
        raise HTTPException(status_code=404, detail="Session not found")
    result = session_results[session_id]
    if result.get("status") == "error":
        raise HTTPException(status_code=500, detail=result.get("error"))
    return result

@router.get("/status/{session_id}")
async def get_inference_status(session_id: str):
    """Get inference status for a session"""
    if session_id not in session_results:
        return {"status": "not_found"}
    result = session_results[session_id]
    return {
        "status": result.get("status", "processing"),
        "total_detections": result.get("total_detections", 0),
        "processed_frames": result.get("processed_frames", 0),
    }
