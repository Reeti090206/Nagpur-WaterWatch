import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey, Boolean
from app.database import Base


class IncidentSeverity(str, enum.Enum):
    LOW = "low"
    MODERATE = "moderate"
    SEVERE = "severe"
    CRITICAL = "critical"


class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "unverified"
    VERIFIED = "verified"
    DISPUTED = "disputed"


class HistoricalIncident(Base):
    __tablename__ = "historical_incidents"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("waterlogging_locations.id"), nullable=False, index=True)
    location_name = Column(String(255), nullable=False)
    date = Column(DateTime, nullable=False, index=True)
    duration_hours = Column(Float, nullable=True)
    max_water_level_cm = Column(Float, nullable=True)
    rainfall_mm = Column(Float, nullable=True)
    severity = Column(Enum(IncidentSeverity), nullable=False)
    clearance_time_hours = Column(Float, nullable=True)
    probable_cause = Column(Text, nullable=True)
    affected_roads = Column(Text, nullable=True)  # comma-separated
    verification_status = Column(Enum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    is_resolved = Column(Boolean, default=False)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    notes = Column(Text, nullable=True)
    is_demo_data = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
