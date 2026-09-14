from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.common import RouteRequest, RouteResponse
from app.services.route_service import generate_demo_route_analysis

router = APIRouter(prefix="/api/routes", tags=["Route Analysis"])


@router.post("/analyze", response_model=RouteResponse)
def analyze_route(request: RouteRequest, db: Session = Depends(get_db)):
    """
    Analyze routes between origin and destination for waterlogging risk.

    This endpoint overlays the project's own waterlogging data (from sensors,
    predictions, and verified reports) on routing results.

    NOTE: When GOOGLE_MAPS_API_KEY is not configured, this uses demo route
    generation. With a valid API key, it will query Google Maps Directions API
    for actual routes and then analyze them.
    """
    result = generate_demo_route_analysis(
        origin=(request.origin_lat, request.origin_lng),
        destination=(request.destination_lat, request.destination_lng),
        db=db,
    )
    return result
