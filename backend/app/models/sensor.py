import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class SensorStatus(str, enum.Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    MAINTENANCE = "maintenance"


class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(String(50), unique=True, index=True, nullable=False)  # e.g., NGP-S001
    name = Column(String(255), nullable=False)
    location_name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    status = Column(Enum(SensorStatus), default=SensorStatus.ONLINE)
    battery_level = Column(Float, default=100.0)
    installed_at = Column(DateTime, default=datetime.utcnow)
    last_reading_at = Column(DateTime, nullable=True)
    is_simulated = Column(Boolean, default=True)
    location_id = Column(Integer, ForeignKey("waterlogging_locations.id"), nullable=True)

    readings = relationship("SensorReading", back_populates="sensor", lazy="dynamic")

    def __repr__(self):
        return f"<Sensor {self.sensor_id} at {self.location_name}>"


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    sensor_db_id = Column(Integer, ForeignKey("sensors.id"), nullable=False, index=True)
    sensor_id = Column(String(50), index=True, nullable=False)  # duplicated for fast lookup
    water_level = Column(Float, nullable=False)  # in cm
    battery_level = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    is_simulated = Column(Boolean, default=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    received_at = Column(DateTime, default=datetime.utcnow)

    sensor = relationship("Sensor", back_populates="readings")
