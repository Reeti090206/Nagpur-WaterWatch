from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class SensorReadingCreate(BaseModel):
    sensorId: str
    waterLevel: float
    batteryLevel: Optional[float] = None
    temperature: Optional[float] = None
    timestamp: datetime


class SensorReadingResponse(BaseModel):
    id: int
    sensor_id: str
    water_level: float
    battery_level: Optional[float]
    is_simulated: bool
    timestamp: datetime

    model_config = {"from_attributes": True}


class SensorResponse(BaseModel):
    id: int
    sensor_id: str
    name: str
    location_name: str
    latitude: float
    longitude: float
    status: str
    battery_level: float
    last_reading_at: Optional[datetime]
    is_simulated: bool
    current_water_level: Optional[float] = None

    model_config = {"from_attributes": True}


class SensorCreate(BaseModel):
    sensor_id: str
    name: str
    location_name: str
    latitude: float
    longitude: float
    is_simulated: bool = True
    location_id: Optional[int] = None
