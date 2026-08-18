from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.inspection import Inspection
import csv
import os
from pathlib import Path
from fastapi.responses import FileResponse
import logging

# Reports directory for per-inspection CSVs
BASE_DIR = Path(__file__).resolve().parents[1]
REPORT_DIR = BASE_DIR / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)
logger = logging.getLogger("backend.history")

router = APIRouter(prefix="/api/history", tags=["history"])


def serialize_inspection(item: Inspection):
    return {
        "id": item.id,
        "timestamp": item.timestamp,
        "source": item.source,
        "total_bottles": item.total_bottles,
        "passed": item.passed,
        "failed": item.failed,
        "proper_fill": item.proper_fill,
        "under_fill": item.under_fill,
        "over_fill": item.over_fill,
        "label_ok": item.label_ok,
        "label_torn": item.label_torn,
        "label_missing": item.label_missing,
        "video_path": item.video_path,
        "video_name": Path(item.video_path).name if item.video_path else "Live Camera",
    }


@router.get("/")
async def get_inspection_history(
    skip: int = 0,
    limit: int = 10,
    search: str | None = None,
    source: str | None = None,
    db: Session = Depends(get_db),
):
    """Get inspection history"""
    query = db.query(Inspection)

    if search:
        query = query.filter(Inspection.video_path.contains(search))
    if source:
        query = query.filter(Inspection.source == source)

    total = query.count()
    items = query.order_by(Inspection.id.desc()).offset(skip).limit(limit).all()
    return {"items": [serialize_inspection(item) for item in items], "total": total}


@router.get("/{inspection_id}")
async def get_inspection_detail(inspection_id: int, db: Session = Depends(get_db)):
    """Get detailed information about an inspection"""
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")
    return serialize_inspection(item)


@router.delete("/{inspection_id}")
async def delete_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """Delete an inspection record"""
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")
    db.delete(item)
    db.commit()
    return {"message": "Inspection deleted"}


@router.get("/{inspection_id}/report")
async def download_inspection_report(inspection_id: int, db: Session = Depends(get_db)):
    """Download a CSV report for a single inspection (creates file if missing)."""
    item = db.query(Inspection).filter(Inspection.id == inspection_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inspection not found")

    path = REPORT_DIR / f"inspection_{inspection_id}.csv"
    try:
        if not path.exists():
            temp_path = REPORT_DIR / f".{path.name}.tmp"
            with temp_path.open("w", newline="", encoding="utf-8") as handle:
                writer = csv.writer(handle)
                writer.writerow(["field", "value"])
                for key, value in serialize_inspection(item).items():
                    writer.writerow([key, value])
            try:
                os.chmod(temp_path, 0o644)
            except Exception:
                pass
            temp_path.replace(path)

        if not path.exists():
            raise HTTPException(status_code=500, detail="Report not available")

        headers = {"Content-Disposition": f'attachment; filename="{path.name}"'}
        return FileResponse(path, media_type="text/csv", headers=headers)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Failed to prepare report %s: %s", path, e)
        raise HTTPException(status_code=500, detail="Failed to prepare report file.")
