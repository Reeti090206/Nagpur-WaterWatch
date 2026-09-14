from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.config import get_settings
from app.models.sensor import Sensor, SensorReading, SensorStatus
from app.schemas.sensor import SensorReadingCreate, SensorReadingResponse, SensorResponse, SensorCreate
from app.services.auth_service import require_admin

settings = get_settings()
router = APIRouter(prefix="/api/sensors", tags=["Sensors"])


def verify_sensor_api_key(x_sensor_key: Optional[str] = Header(None)):
    """Validate sensor API key for IoT device submissions."""
    if x_sensor_key != settings.SENSOR_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid sensor API key",
        )


@router.post("/readings", response_model=SensorReadingResponse)
def submit_reading(
    reading: SensorReadingCreate,
    db: Session = Depends(get_db),
    _=Depends(verify_sensor_api_key),
):
    """
    Submit a sensor reading (ESP32/Arduino compatible endpoint).
    Requires X-Sensor-Key header for authentication.
    """
    sensor = db.query(Sensor).filter(Sensor.sensor_id == reading.sensorId).first()
    if not sensor:
        raise HTTPException(status_code=404, detail=f"Sensor {reading.sensorId} not found")

    # Validate water level range
    if reading.waterLevel < 0 or reading.waterLevel > 500:
        raise HTTPException(status_code=400, detail="Water level must be between 0 and 500 cm")

    db_reading = SensorReading(
        sensor_db_id=sensor.id,
        sensor_id=reading.sensorId,
        water_level=reading.waterLevel,
        battery_level=reading.batteryLevel,
        temperature=reading.temperature,
        is_simulated=sensor.is_simulated,
        timestamp=reading.timestamp,
    )
    db.add(db_reading)

    # Update sensor status
    sensor.last_reading_at = reading.timestamp
    sensor.status = SensorStatus.ONLINE
    if reading.batteryLevel is not None:
        sensor.battery_level = reading.batteryLevel

    db.commit()
    db.refresh(db_reading)
    return db_reading


@router.get("/", response_model=list[SensorResponse])
def list_sensors(db: Session = Depends(get_db)):
    """List all registered sensors with their latest reading."""
    sensors = db.query(Sensor).all()
    results = []
    for s in sensors:
        latest = (
            db.query(SensorReading)
            .filter(SensorReading.sensor_db_id == s.id)
            .order_by(SensorReading.timestamp.desc())
            .first()
        )
        data = SensorResponse.model_validate(s)
        data.current_water_level = latest.water_level if latest else 0
        results.append(data)
    return results


@router.get("/{sensor_id}", response_model=SensorResponse)
def get_sensor(sensor_id: str, db: Session = Depends(get_db)):
    """Get details for a specific sensor."""
    sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    latest = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_db_id == sensor.id)
        .order_by(SensorReading.timestamp.desc())
        .first()
    )
    data = SensorResponse.model_validate(sensor)
    data.current_water_level = latest.water_level if latest else 0
    return data


@router.get("/{sensor_id}/readings", response_model=list[SensorReadingResponse])
def get_sensor_readings(sensor_id: str, limit: int = 50, db: Session = Depends(get_db)):
    """Get recent readings for a sensor."""
    sensor = db.query(Sensor).filter(Sensor.sensor_id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    readings = (
        db.query(SensorReading)
        .filter(SensorReading.sensor_db_id == sensor.id)
        .order_by(SensorReading.timestamp.desc())
        .limit(limit)
        .all()
    )
    return readings


@router.post("/", response_model=SensorResponse, dependencies=[Depends(require_admin)])
def create_sensor(sensor_data: SensorCreate, db: Session = Depends(get_db)):
    """Create a new sensor (admin only)."""
    existing = db.query(Sensor).filter(Sensor.sensor_id == sensor_data.sensor_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sensor ID already exists")
    sensor = Sensor(**sensor_data.model_dump())
    db.add(sensor)
    db.commit()
    db.refresh(sensor)
    return SensorResponse.model_validate(sensor)
