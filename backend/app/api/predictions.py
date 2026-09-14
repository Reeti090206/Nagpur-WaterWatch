from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.prediction import Prediction
from app.schemas.common import PredictionResponse
from app.services.prediction_engine import run_predictions

router = APIRouter(prefix="/api/predictions", tags=["Predictions"])


@router.get("/", response_model=list[PredictionResponse])
def list_predictions(limit: int = 50, db: Session = Depends(get_db)):
    """Get the latest predictions for all monitored locations."""
    return (
        db.query(Prediction)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/run", response_model=list[PredictionResponse])
def trigger_predictions(db: Session = Depends(get_db)):
    """
    Run the prediction engine for all vulnerable locations.
    NOTE: Uses a demo/rule-based risk engine. See model_version field.
    """
    predictions = run_predictions(db)
    return predictions


@router.get("/location/{location_id}", response_model=list[PredictionResponse])
def predictions_by_location(location_id: int, limit: int = 20, db: Session = Depends(get_db)):
    """Get prediction history for a specific location."""
    return (
        db.query(Prediction)
        .filter(Prediction.location_id == location_id)
        .order_by(Prediction.created_at.desc())
        .limit(limit)
        .all()
    )
