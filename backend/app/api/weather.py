from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.weather_service import get_current_weather
from app.models.weather import RainfallObservation
from app.schemas.common import WeatherResponse

router = APIRouter(prefix="/api/weather", tags=["Weather"])


@router.get("/current")
async def current_weather(db: Session = Depends(get_db)):
    """
    Get current weather/rainfall data for Nagpur.
    Uses OpenWeatherMap if API key is configured, otherwise returns simulated data.
    The response includes the actual data source.
    """
    return await get_current_weather(db)


@router.get("/history", response_model=list[WeatherResponse])
def weather_history(limit: int = 24, db: Session = Depends(get_db)):
    """Get recent weather observations."""
    return (
        db.query(RainfallObservation)
        .order_by(RainfallObservation.observed_at.desc())
        .limit(limit)
        .all()
    )
