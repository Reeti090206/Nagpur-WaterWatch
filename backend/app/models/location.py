import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.database import Base


class SeverityLevel(str, enum.Enum):
    NORMAL = "normal"       # Green: Road Clear
    LOW = "low"             # Yellow: Low Waterlogging / Caution
    MODERATE = "moderate"   # Orange: Moderate / Avoid if Possible
    SEVERE = "severe"       # Red: Road Unsafe


class WaterloggingLocation(Base):
    __tablename__ = "waterlogging_locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    area = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    description = Column(Text, nullable=True)
    current_severity = Column(Enum(SeverityLevel), default=SeverityLevel.NORMAL)
    current_water_level = Column(Float, default=0.0)
    is_vulnerable = Column(Boolean, default=True)
    vulnerability_reason = Column(Text, nullable=True)  # e.g., "Low-lying area", "Poor drainage"
    elevation_m = Column(Float, nullable=True)
    drainage_capacity = Column(String(50), nullable=True)  # low, medium, high
    historical_frequency = Column(Integer, default=0)  # number of past incidents
    last_incident_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    sensors = relationship("Sensor", backref="location", lazy="dynamic")

    def __repr__(self):
        return f"<Location {self.name} ({self.area})>"
