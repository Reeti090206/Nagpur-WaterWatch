from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
from app.api import auth, sensors, locations, reports, weather, predictions, routes, dashboard, admin

settings = get_settings()

app = FastAPI(
    title="Nagpur WaterWatch API",
    description=(
        "Real-Time and Predictive Waterlogging Monitoring and Intelligent "
        "Route Recommendation System for Nagpur."
    ),
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(sensors.router)
app.include_router(locations.router)
app.include_router(reports.router)
app.include_router(weather.router)
app.include_router(predictions.router)
app.include_router(routes.router)
app.include_router(dashboard.router)
app.include_router(admin.router)


@app.on_event("startup")
def on_startup():
    """Create database tables on startup."""
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {
        "name": "Nagpur WaterWatch API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running",
    }


@app.get("/api/health")
def health_check():
    return {"status": "healthy"}
