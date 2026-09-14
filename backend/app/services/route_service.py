"""
Route Risk Analysis Service for Nagpur WaterWatch
====================================================
Analyzes Google Maps routes against current waterlogging data
to recommend safer alternatives.

NOTE: This service overlays waterlogging data onto routing results.
Google Maps does not provide waterlogging information — all risk data
comes from the project's own sensors, predictions, and verified reports.
"""

import math
from typing import Optional
from sqlalchemy.orm import Session
from app.models.location import WaterloggingLocation, SeverityLevel


# Severity weights for route risk scoring
SEVERITY_WEIGHTS = {
    "normal": 0,
    "low": 1,
    "moderate": 3,
    "severe": 5,
}

# Proximity threshold (meters) — how close a route point must be to a
# waterlogging location to be considered "affected"
PROXIMITY_THRESHOLD_M = 500


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points in meters using Haversine formula."""
    R = 6371000  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def analyze_route_risk(
    route_points: list[tuple[float, float]],
    db: Session,
) -> dict:
    """
    Analyze a list of route waypoints against known waterlogging locations.
    Returns affected segments, max severity, and risk score.
    """
    locations = db.query(WaterloggingLocation).filter(
        WaterloggingLocation.is_active == True,
    ).all()

    affected_segments = []
    max_severity = "normal"
    max_severity_weight = 0

    for loc in locations:
        if loc.current_severity == SeverityLevel.NORMAL:
            continue

        # Check if any route point is near this waterlogging location
        min_distance = float("inf")
        for point in route_points:
            d = haversine_distance(point[0], point[1], loc.latitude, loc.longitude)
            min_distance = min(min_distance, d)

        if min_distance <= PROXIMITY_THRESHOLD_M:
            sev = loc.current_severity.value
            affected_segments.append({
                "location_name": loc.name,
                "severity": sev,
                "water_level": loc.current_water_level or 0,
                "distance_m": round(min_distance, 0),
            })
            w = SEVERITY_WEIGHTS.get(sev, 0)
            if w > max_severity_weight:
                max_severity_weight = w
                max_severity = sev

    # Compute risk score: normalize weighted sum
    total_weight = sum(SEVERITY_WEIGHTS.get(s["severity"], 0) for s in affected_segments)
    # Normalize to 0–1 range (assume max possible is 5 segments * 5 weight)
    risk_score = min(total_weight / 25.0, 1.0) if affected_segments else 0.0

    return {
        "affected_segments": affected_segments,
        "max_severity": max_severity,
        "risk_score": round(risk_score, 3),
        "num_affected": len(affected_segments),
    }


def generate_demo_route_analysis(
    origin: tuple[float, float],
    destination: tuple[float, float],
    db: Session,
) -> dict:
    """
    Generate demo route analysis when Google Maps API is not configured.
    Creates two synthetic route options with different risk profiles.
    """
    # Generate two plausible routes through Nagpur
    mid_lat = (origin[0] + destination[0]) / 2
    mid_lng = (origin[1] + destination[1]) / 2

    # Route A: Direct (potentially through waterlogged areas)
    route_a_points = [
        origin,
        (mid_lat, mid_lng),
        destination,
    ]
    # Route B: Slight detour
    route_b_points = [
        origin,
        (mid_lat + 0.005, mid_lng + 0.008),
        (mid_lat - 0.003, mid_lng + 0.012),
        destination,
    ]

    risk_a = analyze_route_risk(route_a_points, db)
    risk_b = analyze_route_risk(route_b_points, db)

    dist_a = haversine_distance(origin[0], origin[1], destination[0], destination[1]) / 1000
    dist_b = dist_a * 1.12  # slightly longer

    routes = [
        {
            "route_index": 0,
            "summary": "Route A (Direct)",
            "distance_km": round(dist_a, 1),
            "duration_min": round(dist_a * 3.5, 0),
            "affected_segments": risk_a["num_affected"],
            "max_severity": risk_a["max_severity"],
            "risk_score": risk_a["risk_score"],
            "recommendation": "Higher Risk" if risk_a["risk_score"] > risk_b["risk_score"] else "Lower Risk",
            "segments": risk_a["affected_segments"],
        },
        {
            "route_index": 1,
            "summary": "Route B (Alternative)",
            "distance_km": round(dist_b, 1),
            "duration_min": round(dist_b * 3.5, 0),
            "affected_segments": risk_b["num_affected"],
            "max_severity": risk_b["max_severity"],
            "risk_score": risk_b["risk_score"],
            "recommendation": "Higher Risk" if risk_b["risk_score"] > risk_a["risk_score"] else "Lower Risk",
            "segments": risk_b["affected_segments"],
        },
    ]

    # Determine recommended route
    if risk_a["risk_score"] <= risk_b["risk_score"]:
        recommended = 0
        reason = "Route A is recommended as it has equal or lower waterlogging risk."
    else:
        recommended = 1
        reason = f"Route B is recommended despite being {round(dist_b - dist_a, 1)} km longer, as it avoids {risk_a['num_affected']} waterlogged area(s) encountered on Route A."

    return {
        "routes": routes,
        "recommended_route": recommended,
        "recommendation_reason": reason,
        "is_demo": True,
    }
