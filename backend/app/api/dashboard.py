from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.location import WaterloggingLocation, SeverityLevel
from app.models.sensor import Sensor, SensorStatus
from app.models.report import CitizenReport, ReportStatus
from app.models.prediction import Prediction
from app.models.weather import RainfallObservation
from app.models.incident import HistoricalIncident
from app.models.notification import Notification
from app.schemas.common import DashboardStats, IncidentResponse
from app.services.auth_service import require_authority

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get aggregate statistics for the monitoring dashboard."""
    locations = db.query(WaterloggingLocation).filter(WaterloggingLocation.is_active == True).all()
    total = len(locations)
    severe = sum(1 for l in locations if l.current_severity == SeverityLevel.SEVERE)
    moderate = sum(1 for l in locations if l.current_severity == SeverityLevel.MODERATE)
    low = sum(1 for l in locations if l.current_severity == SeverityLevel.LOW)
    normal = sum(1 for l in locations if l.current_severity == SeverityLevel.NORMAL)

    active_sensors = db.query(Sensor).filter(Sensor.status == SensorStatus.ONLINE).count()
    pending_reports = db.query(CitizenReport).filter(CitizenReport.status == ReportStatus.PENDING).count()
    active_predictions = db.query(Prediction).count()

    latest_weather = (
        db.query(RainfallObservation)
        .order_by(RainfallObservation.observed_at.desc())
        .first()
    )

    return DashboardStats(
        total_locations=total,
        active_sensors=active_sensors,
        severe_locations=severe,
        moderate_locations=moderate,
        low_locations=low,
        normal_locations=normal,
        pending_reports=pending_reports,
        active_predictions=active_predictions,
        latest_rainfall_mm=latest_weather.rainfall_mm if latest_weather else None,
        weather_condition=latest_weather.weather_condition if latest_weather else None,
        data_source=latest_weather.data_source if latest_weather else None,
        last_updated=datetime.utcnow(),
    )


@router.get("/alerts")
def get_recent_alerts(limit: int = 10, db: Session = Depends(get_db)):
    """Get recent notifications and alerts."""
    return (
        db.query(Notification)
        .order_by(Notification.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/hotspots")
def get_hotspot_rankings(db: Session = Depends(get_db)):
    """
    Get waterlogging hotspot rankings based on historical frequency.
    Ranked by number of past incidents — locations with more incidents rank higher.
    """
    locations = (
        db.query(WaterloggingLocation)
        .filter(WaterloggingLocation.is_active == True)
        .order_by(WaterloggingLocation.historical_frequency.desc())
        .limit(20)
        .all()
    )
    return [
        {
            "rank": i + 1,
            "id": loc.id,
            "name": loc.name,
            "area": loc.area,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "historical_frequency": loc.historical_frequency,
            "current_severity": loc.current_severity.value if loc.current_severity else "normal",
            "drainage_capacity": loc.drainage_capacity,
            "vulnerability_reason": loc.vulnerability_reason,
        }
        for i, loc in enumerate(locations)
    ]


@router.get("/incidents", response_model=list[IncidentResponse])
def list_incidents(limit: int = 50, db: Session = Depends(get_db)):
    """List historical waterlogging incidents."""
    return (
        db.query(HistoricalIncident)
        .order_by(HistoricalIncident.date.desc())
        .limit(limit)
        .all()
    )
