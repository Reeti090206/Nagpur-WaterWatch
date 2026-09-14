from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("waterlogging_locations.id"), nullable=False, index=True)
    location_name = Column(String(255), nullable=False)
    risk_level = Column(String(50), nullable=False)  # normal, low, moderate, severe
    risk_score = Column(Float, nullable=False)  # 0.0 to 1.0
    probability = Column(Float, nullable=True)  # model confidence
    predicted_water_level = Column(Float, nullable=True)
    rainfall_current_mm = Column(Float, nullable=True)
    rainfall_cumulative_mm = Column(Float, nullable=True)
    rainfall_intensity = Column(String(50), nullable=True)  # light, moderate, heavy, very_heavy
    contributing_factors = Column(Text, nullable=True)  # JSON string of factors
    model_version = Column(String(50), default="rule-based-v1")
    is_demo = Column(Boolean, default=True)
    prediction_for = Column(DateTime, nullable=False)  # what time this prediction is for
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
