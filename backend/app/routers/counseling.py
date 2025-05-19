from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Response
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import base64

from app.core.database import get_db
from app.schemas.user import SessionInteraction, SessionInteractionCreate
from app.services.counseling_service import process_user_message, get_session_interactions, end_counseling_session, get_user_context
from app.services.elevenlabs_service import ElevenLabsConversationalAI
from app.models.user import Session as SessionModel, SessionStatus
from app.core.auth import get_current_user

router = APIRouter()

@router.post("/interact", response_model=Dict[str, Any])
async def interact_with_ai(
    interaction: SessionInteractionCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Process a single interaction with the AI counselor
    """
    # Verify session belongs to user
    session = db.query(SessionModel).filter(SessionModel.id == interaction.session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
        
    # Update session status if it's the first interaction
    if session.status == SessionStatus.SCHEDULED:
        session.status = SessionStatus.IN_PROGRESS
        db.commit()
    
    response = await process_user_message(db, interaction.session_id, interaction.question)
    
    return {
        "session_id": interaction.session_id,
        "question": interaction.question,
        "answer": response["text"],
        "has_audio": response["audio"] is not None
    }

@router.post("/interact-with-audio")
async def interact_with_audio(
    interaction: SessionInteractionCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Process a single interaction with the AI counselor and return audio
    """
    # Verify session belongs to user
    session = db.query(SessionModel).filter(SessionModel.id == interaction.session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
    
    response = await process_user_message(db, interaction.session_id, interaction.question)
    
    # If audio is available, return it
    if response["audio"]:
        return Response(
            content=response["audio"],
            media_type="audio/wav"
        )
    else:
        # Fallback to text response
        return {"text": response["text"]}

@router.get("/interactions/{session_id}", response_model=List[SessionInteraction])
def get_interactions(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Get all interactions for a specific session
    """
    # Verify session belongs to user
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
        
    interactions = get_session_interactions(db, session_id)
    return interactions

@router.post("/end-session/{session_id}")
async def end_session(
    session_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    End a counseling session and generate a summary
    """
    # Verify session belongs to user
    session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
    if not session or session.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this session"
        )
        
    result = await end_counseling_session(db, session_id)
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["message"]
        )
    return result

@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: int, db: Session = Depends(get_db)):
    """
    WebSocket endpoint for real-time AI counseling
    """
    await websocket.accept()
    
    # Initialize ElevenLabs service
    elevenlabs_ai = ElevenLabsConversationalAI()
    
    try:
        # Get session to verify it exists and get user_id
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            await websocket.send_json({"error": "Session not found"})
            await websocket.close()
            return
            
        user_id = session.user_id
        
        # Update session status if it's the first interaction
        if session.status == SessionStatus.SCHEDULED:
            session.status = SessionStatus.IN_PROGRESS
            db.commit()
        
        # Get user context including psychometric data
        user_context = await get_user_context(db, user_id)
        
        # Start conversation
        await elevenlabs_ai.start_conversation(user_context)
        
        # Send initial message to client
        await websocket.send_json({
            "type": "system",
            "text": "Connected to AI counselor. You can start your conversation now."
        })
        
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            # Send typing indicator
            await websocket.send_json({
                "type": "typing",
                "status": True
            })
            
            # Process message with ElevenLabs
            response = await elevenlabs_ai.process_message(data, user_id, user_context)
            
            # Store interaction in database
            db_interaction = SessionInteraction(
                session_id=session_id,
                question=data,
                answer=response["text"]
            )
            db.add(db_interaction)
            db.commit()
            
            # Send response back to client
            await websocket.send_json({
                "type": "response",
                "text": response["text"],
                "audio": base64.b64encode(response["audio"]).decode("utf-8") if response["audio"] else None
            })
            
    except WebSocketDisconnect:
        print(f"Client disconnected from session {session_id}")
    except Exception as e:
        print(f"Error in WebSocket connection: {str(e)}")
        await websocket.send_json({
            "type": "error",
            "text": "An error occurred during the conversation."
        })
    finally:
        # End conversation
        await elevenlabs_ai.end_conversation()
