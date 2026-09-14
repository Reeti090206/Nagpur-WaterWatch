from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.report import CitizenReport, ReportStatus
from app.models.user import User
from app.schemas.common import ReportCreate, ReportResponse, ReportVerify
from app.services.auth_service import get_current_user, require_authority

router = APIRouter(prefix="/api/reports", tags=["Citizen Reports"])


@router.post("/", response_model=ReportResponse)
def submit_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
):
    """
    Submit a waterlogging report. Can be submitted anonymously or by a logged-in citizen.
    Reports expire after 12 hours and start as 'pending' — they are NOT automatically
    treated as confirmed truth.
    """
    db_report = CitizenReport(
        user_id=current_user.id if current_user else None,
        latitude=report.latitude,
        longitude=report.longitude,
        location_name=report.location_name,
        severity=report.severity,
        description=report.description,
        photo_url=report.photo_url,
        status=ReportStatus.PENDING,
        expires_at=datetime.utcnow() + timedelta(hours=12),
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report


@router.get("/", response_model=list[ReportResponse])
def list_reports(
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    """List citizen reports, optionally filtered by status."""
    query = db.query(CitizenReport).order_by(CitizenReport.created_at.desc())
    if status:
        query = query.filter(CitizenReport.status == status)
    return query.limit(limit).all()


@router.get("/active", response_model=list[ReportResponse])
def list_active_reports(db: Session = Depends(get_db)):
    """List non-expired, pending or verified reports."""
    now = datetime.utcnow()
    return (
        db.query(CitizenReport)
        .filter(
            CitizenReport.status.in_([ReportStatus.PENDING, ReportStatus.VERIFIED]),
            (CitizenReport.expires_at > now) | (CitizenReport.expires_at.is_(None)),
        )
        .order_by(CitizenReport.created_at.desc())
        .all()
    )


@router.put("/{report_id}/verify", response_model=ReportResponse)
def verify_report(
    report_id: int,
    verification: ReportVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_authority),
):
    """
    Verify or reject a citizen report (authority only).
    """
    report = db.query(CitizenReport).filter(CitizenReport.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if verification.status not in ("verified", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'verified' or 'rejected'")

    report.status = ReportStatus(verification.status)
    report.verified_by = current_user.id
    report.verified_at = datetime.utcnow()
    if verification.rejection_reason:
        report.rejection_reason = verification.rejection_reason

    db.commit()
    db.refresh(report)
    return report
