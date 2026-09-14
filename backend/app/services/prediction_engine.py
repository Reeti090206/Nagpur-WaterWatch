"""
Prediction Engine for Nagpur WaterWatch
========================================
This is a DEMO / RULE-BASED risk engine. It does NOT use a trained ML model
because real historical training data is unavailable.

The architecture is prepared for ML training later — swap `predict_risk()`
with a trained model when sufficient data is collected.

Risk Scoring Logic (Rule-Based):
- Rainfall intensity contribution (0–0.35)
- Historical frequency contribution (0–0.25)
- Drainage capacity contribution (0–0.20)
- Current sensor water level contribution (0–0.20)
"""

import json
from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from app.models.location import WaterloggingLocation, SeverityLevel
from app.models.prediction import Prediction
from app.models.sensor import Sensor, SensorReading
from app.models.weather import RainfallObservation


def classify_rainfall_intensity(rainfall_mm: float) -> str:
    """Classify rainfall intensity based on IMD standards."""
    if rainfall_mm < 2.5:
        return "light"
    elif rainfall_mm < 15.0:
        return "moderate"
    elif rainfall_mm < 65.0:
        return "heavy"
    else:
        return "very_heavy"


def compute_risk_score(
    rainfall_mm: float,
    cumulative_rainfall_mm: float,
    historical_frequency: int,
    drainage_capacity: Optional[str],
    current_water_level: float,
) -> tuple[float, str, list[str]]:
    """
    Compute a rule-based risk score from 0.0 to 1.0.
    Returns (score, risk_level, contributing_factors).

    NOTE: This is a demo/rule-based engine, not a scientifically validated model.
    """
    score = 0.0
    factors = []

    # --- Rainfall factor (max 0.35) ---
    if rainfall_mm >= 65:
        score += 0.35
        factors.append(f"Very heavy rainfall ({rainfall_mm:.1f} mm)")
    elif rainfall_mm >= 15:
        score += 0.25
        factors.append(f"Heavy rainfall ({rainfall_mm:.1f} mm)")
    elif rainfall_mm >= 7:
        score += 0.15
        factors.append(f"Moderate rainfall ({rainfall_mm:.1f} mm)")
    elif rainfall_mm >= 2.5:
        score += 0.08
        factors.append(f"Light rainfall ({rainfall_mm:.1f} mm)")

    # Cumulative rainfall bonus
    if cumulative_rainfall_mm >= 100:
        score += 0.10
        factors.append(f"High cumulative rainfall ({cumulative_rainfall_mm:.1f} mm)")
    elif cumulative_rainfall_mm >= 50:
        score += 0.05
        factors.append(f"Moderate cumulative rainfall ({cumulative_rainfall_mm:.1f} mm)")

    # --- Historical frequency factor (max 0.25) ---
    if historical_frequency >= 10:
        score += 0.25
        factors.append(f"Very frequent historical waterlogging ({historical_frequency} incidents)")
    elif historical_frequency >= 5:
        score += 0.18
        factors.append(f"Frequent historical waterlogging ({historical_frequency} incidents)")
    elif historical_frequency >= 2:
        score += 0.10
        factors.append(f"Some historical waterlogging ({historical_frequency} incidents)")

    # --- Drainage capacity factor (max 0.20) ---
    if drainage_capacity == "low":
        score += 0.20
        factors.append("Poor drainage infrastructure")
    elif drainage_capacity == "medium":
        score += 0.10
        factors.append("Moderate drainage capacity")
    elif drainage_capacity == "high":
        score += 0.03

    # --- Current water level factor (max 0.20) ---
    if current_water_level >= 30:
        score += 0.20
        factors.append(f"High current water level ({current_water_level:.0f} cm)")
    elif current_water_level >= 15:
        score += 0.12
        factors.append(f"Elevated water level ({current_water_level:.0f} cm)")
    elif current_water_level >= 5:
        score += 0.05
        factors.append(f"Slight water accumulation ({current_water_level:.0f} cm)")

    # Clamp score
    score = min(score, 1.0)

    # Classify risk level
    if score >= 0.7:
        risk_level = "severe"
    elif score >= 0.45:
        risk_level = "moderate"
    elif score >= 0.2:
        risk_level = "low"
    else:
        risk_level = "normal"

    return score, risk_level, factors


def get_severity_from_risk(risk_level: str) -> SeverityLevel:
    mapping = {
        "normal": SeverityLevel.NORMAL,
        "low": SeverityLevel.LOW,
        "moderate": SeverityLevel.MODERATE,
        "severe": SeverityLevel.SEVERE,
    }
    return mapping.get(risk_level, SeverityLevel.NORMAL)


def run_predictions(db: Session) -> list[Prediction]:
    """
    Run the prediction engine for all active vulnerable locations.
    Generates a Prediction record for each location and updates
    the location's current severity.
    """
    locations = db.query(WaterloggingLocation).filter(
        WaterloggingLocation.is_active == True,
        WaterloggingLocation.is_vulnerable == True,
    ).all()

    # Get latest weather observation
    latest_weather = (
        db.query(RainfallObservation)
        .order_by(RainfallObservation.observed_at.desc())
        .first()
    )
    rainfall_mm = latest_weather.rainfall_mm if latest_weather else 0.0
    cumulative = rainfall_mm * 3  # simplified: estimate cumulative as 3x current for demo

    predictions = []
    now = datetime.utcnow()

    for loc in locations:
        # Get latest sensor reading for this location
        water_level = loc.current_water_level or 0.0
        latest_sensor = (
            db.query(Sensor)
            .filter(Sensor.location_id == loc.id)
            .first()
        )
        if latest_sensor:
            latest_reading = (
                db.query(SensorReading)
                .filter(SensorReading.sensor_db_id == latest_sensor.id)
                .order_by(SensorReading.timestamp.desc())
                .first()
            )
            if latest_reading:
                water_level = latest_reading.water_level

        score, risk_level, factors = compute_risk_score(
            rainfall_mm=rainfall_mm,
            cumulative_rainfall_mm=cumulative,
            historical_frequency=loc.historical_frequency,
            drainage_capacity=loc.drainage_capacity,
            current_water_level=water_level,
        )

        prediction = Prediction(
            location_id=loc.id,
            location_name=loc.name,
            risk_level=risk_level,
            risk_score=round(score, 3),
            probability=round(score, 3),  # rule-based: score = probability
            predicted_water_level=water_level * (1 + score),
            rainfall_current_mm=rainfall_mm,
            rainfall_cumulative_mm=cumulative,
            rainfall_intensity=classify_rainfall_intensity(rainfall_mm),
            contributing_factors=json.dumps(factors),
            model_version="rule-based-v1",
            is_demo=True,
            prediction_for=now,
            created_at=now,
        )
        db.add(prediction)
        predictions.append(prediction)

        # Update location severity
        loc.current_severity = get_severity_from_risk(risk_level)
        loc.current_water_level = water_level

    db.commit()
    return predictions
