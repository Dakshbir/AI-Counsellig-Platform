from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.user import PsychometricData, CareerRoadmap
from app.services.report_service import upload_psychometric_report, generate_career_roadmap, get_user_roadmaps
from app.core.auth import get_current_user
from app.models.user import PsychometricData as PsychometricDataModel

router = APIRouter()

@router.post("/psychometric", response_model=PsychometricData)
async def upload_report(
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Upload and process a psychometric test report
    """
    result = await upload_psychometric_report(db, current_user.id, file)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to process psychometric report"
        )
    return result

@router.get("/psychometric/latest", response_model=PsychometricData)
def get_latest_psychometric_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get the latest psychometric data for the current user
    """
    data = db.query(PsychometricDataModel).filter(
        PsychometricDataModel.user_id == current_user.id
    ).order_by(PsychometricDataModel.uploaded_at.desc()).first()
    
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No psychometric data found"
        )
    return data

@router.post("/roadmap", response_model=CareerRoadmap)
async def create_roadmap(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Generate a career roadmap based on psychometric data
    """
    roadmap = await generate_career_roadmap(db, current_user.id)
    if not roadmap:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to generate career roadmap. Ensure psychometric data exists."
        )
    return roadmap

@router.get("/roadmaps", response_model=List[CareerRoadmap])
def get_roadmaps(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all career roadmaps for the current user
    """
    roadmaps = get_user_roadmaps(db, current_user.id)
    return roadmaps

@router.get("/roadmaps/{user_id}", response_model=List[CareerRoadmap])
def get_user_roadmaps_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all career roadmaps for a specific user (admin only)
    """
    # Check if user is admin
    if current_user.role != "admin" and current_user.role != "counselor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
        
    roadmaps = get_user_roadmaps(db, user_id)
    return roadmaps
