from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(String(1000), nullable=False)
    notification_type = Column(String(50), nullable=False)  # alert, warning, info
    severity = Column(String(50), nullable=True)
    location_id = Column(Integer, ForeignKey("waterlogging_locations.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    target_role = Column(String(50), nullable=True)  # citizen, authority, all
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
