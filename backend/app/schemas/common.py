from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class LocationResponse(BaseModel):
    id: int
    name: str
    area: str
    latitude: float
    longitude: float
    description: Optional[str]
    current_severity: str
    current_water_level: float
    is_vulnerable: bool
    vulnerability_reason: Optional[str]
    drainage_capacity: Optional[str]
    historical_frequency: int
    last_incident_at: Optional[datetime]
    is_active: bool

    model_config = {"from_attributes": True}


class LocationCreate(BaseModel):
    name: str
    area: str
    latitude: float
    longitude: float
    description: Optional[str] = None
    is_vulnerable: bool = True
    vulnerability_reason: Optional[str] = None
    elevation_m: Optional[float] = None
    drainage_capacity: Optional[str] = None


class ReportCreate(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = None
    severity: str  # low, moderate, severe
    description: Optional[str] = None
    photo_url: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    user_id: Optional[int]
    latitude: float
    longitude: float
    location_name: Optional[str]
    severity: str
    description: Optional[str]
    photo_url: Optional[str]
    status: str
    confidence_score: Optional[float]
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportVerify(BaseModel):
    status: str  # verified, rejected
    rejection_reason: Optional[str] = None


class PredictionResponse(BaseModel):
    id: int
    location_id: int
    location_name: str
    risk_level: str
    risk_score: float
    probability: Optional[float]
    predicted_water_level: Optional[float]
    rainfall_current_mm: Optional[float]
    rainfall_cumulative_mm: Optional[float]
    rainfall_intensity: Optional[str]
    contributing_factors: Optional[str]
    model_version: str
    is_demo: bool
    prediction_for: datetime
    created_at: datetime

    model_config = {"from_attributes": True}


class WeatherResponse(BaseModel):
    rainfall_mm: float
    intensity: Optional[str]
    humidity: Optional[float]
    temperature_c: Optional[float]
    wind_speed_kmh: Optional[float]
    weather_condition: Optional[str]
    forecast_rainfall_mm: Optional[float]
    data_source: str
    is_simulated: bool
    observed_at: datetime

    model_config = {"from_attributes": True}


class IncidentResponse(BaseModel):
    id: int
    location_id: int
    location_name: str
    date: datetime
    duration_hours: Optional[float]
    max_water_level_cm: Optional[float]
    rainfall_mm: Optional[float]
    severity: str
    clearance_time_hours: Optional[float]
    probable_cause: Optional[str]
    affected_roads: Optional[str]
    verification_status: str
    is_resolved: bool
    is_demo_data: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    total_locations: int
    active_sensors: int
    severe_locations: int
    moderate_locations: int
    low_locations: int
    normal_locations: int
    pending_reports: int
    active_predictions: int
    latest_rainfall_mm: Optional[float]
    weather_condition: Optional[str]
    data_source: Optional[str]
    last_updated: datetime


class RouteRequest(BaseModel):
    origin_lat: float
    origin_lng: float
    destination_lat: float
    destination_lng: float


class RouteSegmentRisk(BaseModel):
    location_name: str
    severity: str
    water_level: float
    distance_m: float


class RouteAnalysis(BaseModel):
    route_index: int
    summary: str
    distance_km: float
    duration_min: float
    affected_segments: int
    max_severity: str
    risk_score: float
    recommendation: str
    segments: list[RouteSegmentRisk]


class RouteResponse(BaseModel):
    routes: list[RouteAnalysis]
    recommended_route: int
    recommendation_reason: str
