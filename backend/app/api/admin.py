from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserRole
from app.models.sensor import Sensor
from app.models.location import WaterloggingLocation
from app.schemas.user import UserResponse
from app.services.auth_service import require_admin, hash_password

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserResponse], dependencies=[Depends(require_admin)])
def list_users(db: Session = Depends(get_db)):
    """List all users (admin only)."""
    return db.query(User).all()


@router.put("/users/{user_id}/role", dependencies=[Depends(require_admin)])
def update_user_role(user_id: int, role: str, db: Session = Depends(get_db)):
    """Update a user's role (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        user.role = UserRole(role)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    db.commit()
    return {"message": f"User {user.username} role updated to {role}"}


@router.delete("/users/{user_id}", dependencies=[Depends(require_admin)])
def deactivate_user(user_id: int, db: Session = Depends(get_db)):
    """Deactivate a user account (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": f"User {user.username} deactivated"}


@router.delete("/sensors/{sensor_id}", dependencies=[Depends(require_admin)])
def delete_sensor(sensor_id: int, db: Session = Depends(get_db)):
    """Remove a sensor (admin only)."""
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    db.delete(sensor)
    db.commit()
    return {"message": f"Sensor {sensor.sensor_id} deleted"}


@router.delete("/locations/{location_id}", dependencies=[Depends(require_admin)])
def deactivate_location(location_id: int, db: Session = Depends(get_db)):
    """Deactivate a monitoring location (admin only)."""
    loc = db.query(WaterloggingLocation).filter(WaterloggingLocation.id == location_id).first()
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    loc.is_active = False
    db.commit()
    return {"message": f"Location {loc.name} deactivated"}
