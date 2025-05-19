from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.core.database import get_db
from app.schemas.user import Session as SessionSchema, SessionCreate, SessionUpdate
from app.services.session_service import create_session, get_session, get_sessions_by_user, update_session, cancel_session
from app.core.auth import get_current_user
from app.models.user import UserRole

router = APIRouter()

@router.post("/", response_model=SessionSchema, status_code=status.HTTP_201_CREATED)
async def create_new_session(
    session: SessionCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Create a new counseling session
    """
    # Ensure user is creating a session for themselves
    if session.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to create sessions for other users"
        )
        
    # If counselor_id is provided, verify the counselor exists
    if session.counselor_id:
        counselor = db.query(User).filter(
            User.id == session.counselor_id,
            User.role == UserRole.COUNSELOR
        ).first()
        
        if not counselor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid counselor ID"
            )
    
    # Ensure scheduled time is in the future
    if session.scheduled_time <= datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Scheduled time must be in the future"
        )
    
    return await create_session(db=db, session=session)

@router.get("/my", response_model=List[SessionSchema])
def read_my_sessions(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all sessions for the current user
    """
    sessions = get_sessions_by_user(db, user_id=current_user.id)
    return sessions

@router.get("/user/{user_id}", response_model=List[SessionSchema])
def read_user_sessions(
    user_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all sessions for a specific user (admin or counselor only)
    """
    # Check if user is admin or counselor
    if current_user.role != "admin" and current_user.role != "counselor" and current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this resource"
        )
        
    sessions = get_sessions_by_user(db, user_id=user_id)
    return sessions

@router.get("/{session_id}", response_model=SessionSchema)
def read_session(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get a specific session
    """
    db_session = get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    # Check if user is authorized to access this session
    if db_session.user_id != current_user.id and current_user.role != "admin" and current_user.role != "counselor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
        
    return db_session

@router.put("/{session_id}", response_model=SessionSchema)
def update_session_info(
    session_id: int, 
    session: SessionUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update a specific session
    """
    db_session = get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    # Check if user is authorized to update this session
    if db_session.user_id != current_user.id and current_user.role != "admin" and current_user.role != "counselor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this session"
        )
        
    return update_session(db=db, session_id=session_id, session=session)

@router.post("/{session_id}/cancel", response_model=SessionSchema)
def cancel_session_endpoint(
    session_id: int,
    reason: str = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Cancel a specific session
    """
    db_session = get_session(db, session_id=session_id)
    if db_session is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
        
    # Check if user is authorized to cancel this session
    if db_session.user_id != current_user.id and current_user.role != "admin" and current_user.role != "counselor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to cancel this session"
        )
        
    return cancel_session(db=db, session_id=session_id, reason=reason)
