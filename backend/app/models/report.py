import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, Text, ForeignKey
from app.database import Base


class ReportStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"
    EXPIRED = "expired"


class CitizenReport(Base):
    __tablename__ = "citizen_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # nullable for anonymous
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True)
    severity = Column(String(50), nullable=False)  # low, moderate, severe
    description = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)  # application-derived score
    matched_location_id = Column(Integer, ForeignKey("waterlogging_locations.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    expires_at = Column(DateTime, nullable=True)  # reports expire after some hours
