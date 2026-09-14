"""
Weather Service Abstraction for Nagpur WaterWatch
===================================================
Modular weather service that supports multiple providers:
- OpenWeatherMap (default fallback)
- IMD API (if available and authorized)
- Simulated data (for demo)

The UI clearly shows the actual data source.
"""

import httpx
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.config import get_settings
from app.models.weather import RainfallObservation

settings = get_settings()


async def fetch_openweathermap(lat: float = 21.1458, lon: float = 79.0882) -> Optional[dict]:
    """Fetch current weather from OpenWeatherMap API."""
    if not settings.WEATHER_API_KEY:
        return None
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": settings.WEATHER_API_KEY,
                    "units": "metric",
                },
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                rain_1h = data.get("rain", {}).get("1h", 0.0)
                return {
                    "rainfall_mm": rain_1h,
                    "humidity": data["main"].get("humidity"),
                    "temperature_c": data["main"].get("temp"),
                    "wind_speed_kmh": data.get("wind", {}).get("speed", 0) * 3.6,
                    "weather_condition": data["weather"][0]["description"] if data.get("weather") else None,
                    "data_source": "openweathermap",
                    "is_simulated": False,
                }
    except Exception:
        return None
    return None


def generate_simulated_weather() -> dict:
    """Generate simulated weather data for demo purposes."""
    import random
    # Simulate monsoon-like conditions for Nagpur
    rainfall = random.choice([0, 0, 2, 5, 8, 12, 20, 35, 50, 70])
    return {
        "rainfall_mm": float(rainfall),
        "humidity": round(random.uniform(60, 95), 1),
        "temperature_c": round(random.uniform(24, 32), 1),
        "wind_speed_kmh": round(random.uniform(5, 35), 1),
        "weather_condition": _get_condition(rainfall),
        "forecast_rainfall_mm": round(rainfall * random.uniform(0.5, 1.5), 1),
        "data_source": "simulated",
        "is_simulated": True,
    }


def _get_condition(rainfall_mm: float) -> str:
    if rainfall_mm >= 50:
        return "heavy thunderstorm"
    elif rainfall_mm >= 15:
        return "heavy rain"
    elif rainfall_mm >= 5:
        return "moderate rain"
    elif rainfall_mm >= 1:
        return "light rain"
    else:
        return "overcast clouds"


async def get_current_weather(db: Session) -> dict:
    """
    Get current weather data, trying real APIs first, falling back to simulation.
    Stores the observation in the database.
    """
    weather_data = None

    # Try real API first
    if settings.WEATHER_API_KEY:
        weather_data = await fetch_openweathermap()

    # Fallback to simulated
    if weather_data is None:
        weather_data = generate_simulated_weather()

    # Classify intensity
    rainfall = weather_data["rainfall_mm"]
    if rainfall >= 65:
        intensity = "very_heavy"
    elif rainfall >= 15:
        intensity = "heavy"
    elif rainfall >= 2.5:
        intensity = "moderate"
    elif rainfall > 0:
        intensity = "light"
    else:
        intensity = "none"

    weather_data["intensity"] = intensity

    # Store observation
    obs = RainfallObservation(
        rainfall_mm=weather_data["rainfall_mm"],
        intensity=intensity,
        humidity=weather_data.get("humidity"),
        temperature_c=weather_data.get("temperature_c"),
        wind_speed_kmh=weather_data.get("wind_speed_kmh"),
        weather_condition=weather_data.get("weather_condition"),
        forecast_rainfall_mm=weather_data.get("forecast_rainfall_mm"),
        data_source=weather_data["data_source"],
        is_simulated=weather_data["is_simulated"],
        observed_at=datetime.utcnow(),
    )
    db.add(obs)
    db.commit()
    db.refresh(obs)

    weather_data["observed_at"] = obs.observed_at.isoformat()
    return weather_data
