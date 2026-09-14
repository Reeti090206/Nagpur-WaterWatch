from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.location import WaterloggingLocation
from app.schemas.common import LocationResponse, LocationCreate
from app.services.auth_service import require_admin

router = APIRouter(prefix="/api/locations", tags=["Locations"])


@router.get("/", response_model=list[LocationResponse])
def list_locations(
    severity: Optional[str] = None,
    vulnerable_only: bool = False,
    db: Session = Depends(get_db),
):
    """List all waterlogging-monitored locations."""
    query = db.query(WaterloggingLocation).filter(WaterloggingLocation.is_active == True)
    if severity:
        query = query.filter(WaterloggingLocation.current_severity == severity)
    if vulnerable_only:
        query = query.filter(WaterloggingLocation.is_vulnerable == True)
    return query.all()


@router.get("/{location_id}", response_model=LocationResponse)
def get_location(location_id: int, db: Session = Depends(get_db)):
    """Get details for a specific location."""
    loc = db.query(WaterloggingLocation).filter(WaterloggingLocation.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc


@router.post("/", response_model=LocationResponse, dependencies=[Depends(require_admin)])
def create_location(data: LocationCreate, db: Session = Depends(get_db)):
    """Create a new monitored location (admin only)."""
    loc = WaterloggingLocation(**data.model_dump())
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc
