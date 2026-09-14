"""
Nagpur WaterWatch — Database Seed Script
==========================================
Seeds the database with DEMO/SAMPLE data for project demonstration.

IMPORTANT: These locations are SAMPLE data for demonstration purposes.
They are NOT officially designated waterlogging hotspots by any authority.
All incident data is fabricated for testing.

Demo Credentials:
  - Citizen:  citizen / citizen123
  - Authority: authority / authority123
  - Admin:    admin / admin123
"""

from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.sensor import Sensor, SensorStatus
from app.models.location import WaterloggingLocation, SeverityLevel
from app.models.incident import HistoricalIncident, IncidentSeverity, VerificationStatus
from app.models.weather import RainfallObservation
from app.models.notification import Notification
from app.services.auth_service import hash_password


def seed_database():
    """Seed the database with demo data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(User).count() > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding database with demo data...")

        # ──────────── USERS ────────────
        users = [
            User(
                email="citizen@waterwatch.demo",
                username="citizen",
                hashed_password=hash_password("citizen123"),
                full_name="Demo Citizen",
                role=UserRole.CITIZEN,
            ),
            User(
                email="authority@waterwatch.demo",
                username="authority",
                hashed_password=hash_password("authority123"),
                full_name="Demo Authority Officer",
                role=UserRole.AUTHORITY,
            ),
            User(
                email="admin@waterwatch.demo",
                username="admin",
                hashed_password=hash_password("admin123"),
                full_name="System Administrator",
                role=UserRole.ADMIN,
            ),
        ]
        db.add_all(users)
        db.flush()
        print(f"  Created {len(users)} demo users")

        # ──────────── LOCATIONS ────────────
        # NOTE: These are sample locations chosen for demonstration.
        # They are NOT officially designated waterlogging hotspots.
        locations_data = [
            {
                "name": "Ambazari Lake Road",
                "area": "Ambazari",
                "lat": 21.1305, "lng": 79.0495,
                "desc": "Low-lying road near Ambazari Lake, prone to runoff accumulation during heavy rains.",
                "drainage": "low", "freq": 12, "severity": SeverityLevel.MODERATE,
                "reason": "Low-lying terrain near lake, poor drainage outlets",
            },
            {
                "name": "Sitabuldi Main Road",
                "area": "Sitabuldi",
                "lat": 21.1458, "lng": 79.0882,
                "desc": "Central commercial area with aging storm water drains.",
                "drainage": "medium", "freq": 8, "severity": SeverityLevel.LOW,
                "reason": "Aging storm drain infrastructure in dense commercial zone",
            },
            {
                "name": "Pardi Naka Underpass",
                "area": "Pardi",
                "lat": 21.1567, "lng": 79.0921,
                "desc": "Railway underpass that collects water during monsoon.",
                "drainage": "low", "freq": 15, "severity": SeverityLevel.SEVERE,
                "reason": "Low-elevation underpass acts as water collection point",
            },
            {
                "name": "Automotive Square",
                "area": "Automotive Square",
                "lat": 21.1340, "lng": 79.0730,
                "desc": "Major traffic junction with insufficient drainage capacity.",
                "drainage": "medium", "freq": 7, "severity": SeverityLevel.LOW,
                "reason": "High traffic area with moderate drainage capacity",
            },
            {
                "name": "Pratap Nagar Square",
                "area": "Pratap Nagar",
                "lat": 21.1210, "lng": 79.0690,
                "desc": "Residential area near nullah prone to overflow.",
                "drainage": "low", "freq": 10, "severity": SeverityLevel.MODERATE,
                "reason": "Adjacent to nullah that overflows during heavy rain",
            },
            {
                "name": "Dharampeth College Road",
                "area": "Dharampeth",
                "lat": 21.1425, "lng": 79.0765,
                "desc": "Road segment with inadequate slope for runoff.",
                "drainage": "medium", "freq": 5, "severity": SeverityLevel.NORMAL,
                "reason": "Flat terrain, water stagnation during prolonged rain",
            },
            {
                "name": "Manewada Road Bridge",
                "area": "Manewada",
                "lat": 21.1680, "lng": 79.1030,
                "desc": "Bridge approach road dips below grade near nullah crossing.",
                "drainage": "low", "freq": 9, "severity": SeverityLevel.MODERATE,
                "reason": "Approach road below grade level at nullah crossing",
            },
            {
                "name": "Hingna T-Point",
                "area": "Hingna",
                "lat": 21.1100, "lng": 79.0150,
                "desc": "Suburban junction with rapid development outpacing drainage upgrades.",
                "drainage": "low", "freq": 6, "severity": SeverityLevel.LOW,
                "reason": "Rapid urbanization without matching drainage infrastructure",
            },
        ]

        location_objects = []
        for ld in locations_data:
            loc = WaterloggingLocation(
                name=ld["name"],
                area=ld["area"],
                latitude=ld["lat"],
                longitude=ld["lng"],
                description=ld["desc"],
                current_severity=ld["severity"],
                current_water_level=random.uniform(0, 25) if ld["severity"] != SeverityLevel.NORMAL else 0,
                is_vulnerable=True,
                vulnerability_reason=ld["reason"],
                drainage_capacity=ld["drainage"],
                historical_frequency=ld["freq"],
                last_incident_at=datetime.utcnow() - timedelta(days=random.randint(1, 30)),
            )
            location_objects.append(loc)

        db.add_all(location_objects)
        db.flush()
        print(f"  Created {len(location_objects)} demo locations")

        # ──────────── SENSORS ────────────
        sensors = []
        for i, loc in enumerate(location_objects):
            sensor = Sensor(
                sensor_id=f"NGP-S{i+1:03d}",
                name=f"Water Level Sensor {i+1}",
                location_name=loc.name,
                latitude=loc.latitude + random.uniform(-0.001, 0.001),
                longitude=loc.longitude + random.uniform(-0.001, 0.001),
                status=SensorStatus.ONLINE,
                battery_level=round(random.uniform(60, 100), 1),
                is_simulated=True,
                location_id=loc.id,
                last_reading_at=datetime.utcnow() - timedelta(minutes=random.randint(1, 30)),
            )
            sensors.append(sensor)

        db.add_all(sensors)
        db.flush()
        print(f"  Created {len(sensors)} demo sensors")

        # ──────────── HISTORICAL INCIDENTS ────────────
        incidents = []
        for loc in location_objects:
            for j in range(random.randint(2, 5)):
                days_ago = random.randint(30, 365)
                severity = random.choice(list(IncidentSeverity))
                incident = HistoricalIncident(
                    location_id=loc.id,
                    location_name=loc.name,
                    date=datetime.utcnow() - timedelta(days=days_ago),
                    duration_hours=round(random.uniform(1, 12), 1),
                    max_water_level_cm=round(random.uniform(5, 60), 1),
                    rainfall_mm=round(random.uniform(10, 120), 1),
                    severity=severity,
                    clearance_time_hours=round(random.uniform(1, 8), 1),
                    probable_cause=random.choice([
                        "Heavy monsoon rainfall",
                        "Blocked drainage",
                        "Nullah overflow",
                        "Inadequate drainage capacity",
                        "Construction debris blocking drains",
                    ]),
                    affected_roads=loc.name,
                    verification_status=VerificationStatus.VERIFIED,
                    is_resolved=True,
                    is_demo_data=True,
                )
                incidents.append(incident)

        db.add_all(incidents)
        print(f"  Created {len(incidents)} demo historical incidents")

        # ──────────── WEATHER OBSERVATIONS ────────────
        weather_obs = []
        for h in range(24):
            obs = RainfallObservation(
                rainfall_mm=round(random.choice([0, 0, 2, 5, 8, 15, 25, 40]) * random.uniform(0.5, 1.5), 1),
                intensity=random.choice(["none", "light", "moderate", "heavy"]),
                humidity=round(random.uniform(60, 95), 1),
                temperature_c=round(random.uniform(24, 32), 1),
                wind_speed_kmh=round(random.uniform(5, 30), 1),
                weather_condition=random.choice(["clear sky", "overcast clouds", "light rain", "moderate rain", "heavy rain"]),
                data_source="simulated",
                is_simulated=True,
                observed_at=datetime.utcnow() - timedelta(hours=h),
            )
            weather_obs.append(obs)

        db.add_all(weather_obs)
        print(f"  Created {len(weather_obs)} demo weather observations")

        # ──────────── NOTIFICATIONS ────────────
        notifications = [
            Notification(
                title="Heavy Rainfall Alert",
                message="Heavy rainfall expected in Nagpur over the next 6 hours. Exercise caution near low-lying areas.",
                notification_type="warning",
                severity="moderate",
                target_role="all",
            ),
            Notification(
                title="Severe Waterlogging — Pardi Naka",
                message="Pardi Naka Underpass reporting severe waterlogging (45 cm). Avoid this route. [DEMO DATA]",
                notification_type="alert",
                severity="severe",
                location_id=location_objects[2].id,
                target_role="all",
            ),
            Notification(
                title="Sensor Maintenance",
                message="Sensor NGP-S003 scheduled for maintenance. Readings may be unavailable.",
                notification_type="info",
                target_role="authority",
            ),
        ]
        db.add_all(notifications)
        print(f"  Created {len(notifications)} demo notifications")

        db.commit()
        print("\nDatabase seeded successfully!")
        print("\nDemo Credentials:")
        print("  Citizen:   citizen / citizen123")
        print("  Authority: authority / authority123")
        print("  Admin:     admin / admin123")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
