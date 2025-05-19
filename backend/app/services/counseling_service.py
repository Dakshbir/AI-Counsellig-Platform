import logging
from sqlalchemy.orm import Session
from app.models.user import SessionInteraction, PsychometricData, User, Session as SessionModel
from app.services.elevenlabs_service import ElevenLabsConversationalAI
from app.core.email import send_session_summary

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def process_user_message(db: Session, session_id: int, message: str) -> dict:
    """
    Process a user message using ElevenLabs Conversational AI and store the interaction
    """
    try:
        # Get session to verify it exists and get user_id
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            logger.error(f"Session {session_id} not found")
            return {"text": "Session not found", "audio": None}
        
        user_id = session.user_id
        logger.info(f"Processing message for session {session_id}, user {user_id}")
        
        # Get user context including psychometric data
        user_context = await get_user_context(db, user_id)
        
        # Process with ElevenLabs
        elevenlabs_ai = ElevenLabsConversationalAI()
        await elevenlabs_ai.start_conversation(user_context)
        response = await elevenlabs_ai.process_message(message, user_id, user_context)
        
        # Store the interaction in the database
        db_interaction = SessionInteraction(
            session_id=session_id,
            question=message,
            answer=response["text"]
        )
        db.add(db_interaction)
        db.commit()
        
        logger.info(f"Stored interaction for session {session_id}")
        return response
        
    except Exception as e:
        logger.error(f"Error processing message: {str(e)}")
        return {
            "text": "I'm sorry, I encountered an error processing your request. Please try again.",
            "audio": None
        }

def get_session_interactions(db: Session, session_id: int):
    """
    Get all interactions for a specific session
    """
    return db.query(SessionInteraction).filter(SessionInteraction.session_id == session_id).order_by(SessionInteraction.timestamp).all()

async def end_counseling_session(db: Session, session_id: int) -> dict:
    """
    End a counseling session and generate a summary
    """
    try:
        # Get all interactions
        interactions = get_session_interactions(db, session_id)
        
        if not interactions:
            logger.warning(f"No interactions found for session {session_id}")
            return {"success": False, "message": "No interactions found for this session"}
            
        # Get the session
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            logger.error(f"Session {session_id} not found")
            return {"success": False, "message": "Session not found"}
            
        # Build transcript
        transcript = ""
        for interaction in interactions:
            transcript += f"Student: {interaction.question}\n"
            transcript += f"Counselor: {interaction.answer}\n\n"
        
        # Get user context
        user_id = session.user_id
        user_context = await get_user_context(db, user_id)
        
        # Generate summary using ElevenLabs
        elevenlabs_ai = ElevenLabsConversationalAI()
        await elevenlabs_ai.start_conversation(user_context)
        
        summary_prompt = f"""
        Please provide a concise summary of this counseling session. Focus on the main topics discussed,
        advice given, and next steps recommended. Format it as a professional session summary that could
        be shared with the student.
        
        Here's the transcript:
        {transcript[:1000]}...
        """
        
        summary_response = await elevenlabs_ai.process_message(summary_prompt, user_id, user_context)
        summary = summary_response["text"]
        
        # Update session status and save transcript/summary
        session.status = "completed"
        session.transcript = transcript
        session.summary = summary
        db.commit()
        
        # Get user details for email
        user = db.query(User).filter(User.id == user_id).first()
        
        # Send session summary email
        session_data = {
            "id": session.id,
            "user_id": user_id,
            "user_name": user.full_name,
            "scheduled_time": session.scheduled_time,
            "summary": summary
        }
        
        await send_session_summary(user.email, session_data)
        
        logger.info(f"Session {session_id} completed successfully")
        return {
            "success": True, 
            "message": "Session ended successfully",
            "summary": summary
        }
        
    except Exception as e:
        logger.error(f"Error ending session {session_id}: {str(e)}")
        return {"success": False, "message": f"Error: {str(e)}"}

async def get_user_context(db: Session, user_id: int) -> dict:
    """
    Get user context including psychometric data
    """
    # Get user details
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        logger.error(f"User {user_id} not found")
        return {}
    
    # Get psychometric data
    psychometric_data = db.query(PsychometricData).filter(
        PsychometricData.user_id == user_id
    ).order_by(PsychometricData.uploaded_at.desc()).first()
    
    # Create context
    context = {
        "name": user.full_name,
        "grade_class": user.grade_class,
        "expectations": user.expectations
    }
    
    if psychometric_data:
        context.update({
            "interests": psychometric_data.interests,
            "skills": psychometric_data.skills,
            "personality_type": psychometric_data.personality_type,
            "aptitude": psychometric_data.aptitude,
            "recommended_careers": psychometric_data.recommended_careers,
            "subjects_interested": psychometric_data.subjects_interested if hasattr(psychometric_data, 'subjects_interested') else []
        })
    
    return context
