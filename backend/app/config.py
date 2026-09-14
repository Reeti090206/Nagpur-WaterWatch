from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./waterwatch.db"

    # JWT Auth
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Google Maps
    GOOGLE_MAPS_API_KEY: str = ""

    # Weather API (OpenWeatherMap fallback)
    WEATHER_API_KEY: str = ""
    WEATHER_API_PROVIDER: str = "openweathermap"  # or "imd" if available

    # Sensor API key for IoT devices
    SENSOR_API_KEY: str = "demo-sensor-key-2026"

    # App
    APP_NAME: str = "Nagpur WaterWatch"
    DEBUG: bool = True
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    return Settings()
