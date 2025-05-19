import logging
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.models.user import Session as SessionModel, SessionStatus, User
from app.schemas.user import SessionCreate, SessionUpdate
from app.core.email import send_session_confirmation, send_session_reminder

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_session(db: Session, session_id: int):
    return db.query(SessionModel).filter(SessionModel.id == session_id).first()

def get_sessions_by_user(db: Session, user_id: int):
    return db.query(SessionModel).filter(SessionModel.user_id == user_id).all()

def get_upcoming_sessions(db: Session, minutes: int = 5):
    """Get sessions starting in the specified number of minutes"""
    now = datetime.utcnow()
    target_time = now + timedelta(minutes=minutes)
    
    return db.query(SessionModel).filter(
        SessionModel.scheduled_time >= now,
        SessionModel.scheduled_time <= target_time,
        SessionModel.status == SessionStatus.SCHEDULED
    ).all()

async def create_session(db: Session, session: SessionCreate):
    try:
        logger.info(f"Creating new {session.session_type} session for user {session.user_id}")
        
        db_session = SessionModel(
            user_id=session.user_id,
            counselor_id=session.counselor_id,
            session_type=session.session_type,
            scheduled_time=session.scheduled_time,
            status=session.status
        )
        db.add(db_session)
        db.commit()
        db.refresh(db_session)
        
        # Get user details for email
        user = db.query(User).filter(User.id == session.user_id).first()
        
        # Send confirmation email
        session_data = {
            "id": db_session.id,
            "user_id": db_session.user_id,
            "user_name": user.full_name,
            "session_type": db_session.session_type,
            "scheduled_time": db_session.scheduled_time,
            "status": db_session.status
        }
        
        await send_session_confirmation(user.email, session_data)
        
        logger.info(f"Session created with ID: {db_session.id}")
        return db_session
    except Exception as e:
        logger.error(f"Error creating session: {str(e)}")
        db.rollback()
        raise

def update_session(db: Session, session_id: int, session: SessionUpdate):
    try:
        db_session = get_session(db, session_id)
        if not db_session:
            logger.error(f"Session {session_id} not found")
            return None
            
        update_data = session.dict(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(db_session, key, value)
        
        db.commit()
        db.refresh(db_session)
        
        logger.info(f"Session {session_id} updated with status: {db_session.status}")
        return db_session
    except Exception as e:
        logger.error(f"Error updating session {session_id}: {str(e)}")
        db.rollback()
        raise

def start_session(db: Session, session_id: int):
    """
    Mark a session as in progress
    """
    try:
        db_session = get_session(db, session_id)
        if not db_session:
            logger.error(f"Session {session_id} not found")
            return None
            
        db_session.status = SessionStatus.IN_PROGRESS
        
        db.commit()
        db.refresh(db_session)
        
        logger.info(f"Session {session_id} marked as in progress")
        return db_session
    except Exception as e:
        logger.error(f"Error starting session {session_id}: {str(e)}")
        db.rollback()
        raise

def complete_session(db: Session, session_id: int, transcript: str, summary: str = None):
    """
    Mark a session as completed and save the transcript and summary
    """
    try:
        db_session = get_session(db, session_id)
        if not db_session:
            logger.error(f"Session {session_id} not found")
            return None
            
        db_session.status = SessionStatus.COMPLETED
        db_session.transcript = transcript
        db_session.summary = summary
        
        db.commit()
        db.refresh(db_session)
        
        logger.info(f"Session {session_id} marked as completed")
        return db_session
    except Exception as e:
        logger.error(f"Error completing session {session_id}: {str(e)}")
        db.rollback()
        raise

def cancel_session(db: Session, session_id: int, reason: str = None):
    """
    Mark a session as cancelled
    """
    try:
        db_session = get_session(db, session_id)
        if not db_session:
            logger.error(f"Session {session_id} not found")
            return None
            
        db_session.status = SessionStatus.CANCELLED
        
        # Store cancellation reason in summary field
        if reason:
            db_session.summary = f"Cancelled: {reason}"
        
        db.commit()
        db.refresh(db_session)
        
        logger.info(f"Session {session_id} cancelled")
        return db_session
    except Exception as e:
        logger.error(f"Error cancelling session {session_id}: {str(e)}")
        db.rollback()
        raise

async def send_session_reminders(db: Session):
    """
    Send reminders for sessions starting soon
    """
    upcoming_sessions = get_upcoming_sessions(db)
    
    for session in upcoming_sessions:
        try:
            # Get user details
            user = db.query(User).filter(User.id == session.user_id).first()
            
            # Prepare session data
            session_data = {
                "id": session.id,
                "user_id": session.user_id,
                "user_name": user.full_name,
                "session_type": session.session_type,
                "scheduled_time": session.scheduled_time,
                "status": session.status
            }
            
            # Send reminder email
            await send_session_reminder(user.email, session_data)
            
            logger.info(f"Reminder sent for session {session.id}")
        except Exception as e:
            logger.error(f"Error sending reminder for session {session.id}: {str(e)}")
