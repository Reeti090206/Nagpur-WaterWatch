from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.database import Base


class RainfallObservation(Base):
    __tablename__ = "rainfall_observations"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String(255), default="Nagpur")
    latitude = Column(Float, default=21.1458)
    longitude = Column(Float, default=79.0882)
    rainfall_mm = Column(Float, nullable=False)
    intensity = Column(String(50), nullable=True)  # light, moderate, heavy, very_heavy
    humidity = Column(Float, nullable=True)
    temperature_c = Column(Float, nullable=True)
    wind_speed_kmh = Column(Float, nullable=True)
    weather_condition = Column(String(100), nullable=True)
    forecast_rainfall_mm = Column(Float, nullable=True)  # next N hours
    data_source = Column(String(100), nullable=False)  # "openweathermap", "imd", "simulated"
    is_simulated = Column(Boolean, default=True)
    observed_at = Column(DateTime, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
