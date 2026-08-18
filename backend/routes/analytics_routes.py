from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database.db import get_db
from models.inspection import Inspection

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


def _safe_int(value):
    return int(value or 0)


@router.get("/dashboard")
async def get_dashboard_analytics(db: Session = Depends(get_db)):
    """Get dashboard analytics data"""
    totals = db.query(
        func.coalesce(func.sum(Inspection.total_bottles), 0),
        func.coalesce(func.sum(Inspection.passed), 0),
        func.coalesce(func.sum(Inspection.failed), 0),
        func.coalesce(func.sum(Inspection.proper_fill), 0),
        func.coalesce(func.sum(Inspection.under_fill), 0),
        func.coalesce(func.sum(Inspection.over_fill), 0),
        func.coalesce(func.sum(Inspection.label_ok), 0),
        func.coalesce(func.sum(Inspection.label_torn), 0),
        func.coalesce(func.sum(Inspection.label_missing), 0),
        func.count(Inspection.id),
    ).one()

    (total_bottles, passed, failed, proper_fill, under_fill, over_fill, label_ok, label_torn, label_missing, total_inspections) = totals
    pass_fail = [
        {"name": "Pass", "value": _safe_int(passed)},
        {"name": "Fail", "value": _safe_int(failed)},
    ]
    defects = [
        {"name": "Under Fill", "value": _safe_int(under_fill)},
        {"name": "Over Fill", "value": _safe_int(over_fill)},
        {"name": "Label Torn", "value": _safe_int(label_torn)},
        {"name": "Label Missing", "value": _safe_int(label_missing)},
    ]

    recent_items = (
        db.query(Inspection)
        .order_by(Inspection.id.desc())
        .limit(6)
        .all()
    )
    trend = [
        {
            "name": item.timestamp,
            "passed": _safe_int(item.passed),
            "failed": _safe_int(item.failed),
            "total": _safe_int(item.total_bottles),
            "defects": _safe_int(item.failed),
        }
        for item in reversed(recent_items)
    ]

    return {
        "totals": {
            "total_inspections": _safe_int(total_inspections),
            "total_bottles": _safe_int(total_bottles),
            "passed": _safe_int(passed),
            "failed": _safe_int(failed),
            "proper_fill": _safe_int(proper_fill),
            "under_fill": _safe_int(under_fill),
            "over_fill": _safe_int(over_fill),
            "label_ok": _safe_int(label_ok),
            "label_torn": _safe_int(label_torn),
            "label_missing": _safe_int(label_missing),
        },
        "pass_fail": pass_fail,
        "defects": defects,
        "trend": trend,
        "model_ready": True,
        "model_error": None,
    }


@router.get("/stats")
async def get_statistics():
    """Get detailed statistics"""
    return {"stats": {}}


@router.delete("/clear")
async def clear_analytics(db: Session = Depends(get_db)):
    """Clear stored analytics data."""
    deleted = db.query(Inspection).delete(synchronize_session=False)
    db.commit()
    return {"success": True, "deleted": deleted}
