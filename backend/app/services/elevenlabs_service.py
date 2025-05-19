import json
import asyncio
import websockets
import base64
import uuid
import logging
from typing import Dict, Any, Optional, List
from app.core.config import settings

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ElevenLabsConversationalAI:
    """Service for interacting with ElevenLabs Conversational AI"""
    
    def __init__(self, agent_id: Optional[str] = None):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.agent_id = agent_id or settings.ELEVENLABS_AGENT_ID
        self.websocket_url = f"wss://api.elevenlabs.io/v1/convai/conversation?agent_id={self.agent_id}"
        self.conversation_id = str(uuid.uuid4())
        logger.info(f"Initializing ElevenLabs Conversational AI with agent ID: {self.agent_id}")
    
    async def start_conversation(self, user_data: Dict[str, Any]) -> str:
        """
        Initialize a conversation with the ElevenLabs agent
        Returns the conversation ID
        """
        logger.info(f"Starting conversation with user context: {user_data.keys()}")
        return self.conversation_id
    
    async def process_message(self, message: str, user_id: int, user_context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Process a text message through the ElevenLabs Conversational AI
        Returns the agent's response with audio data
        """
        # Check if ElevenLabs API key is configured
        if self.api_key == "your-elevenlabs-api-key" or self.agent_id == "your-agent-id":
            logger.warning("ElevenLabs API key or agent ID not configured. Using fallback response.")
            return {
                "text": f"I'm a career counselor AI. You asked: {message}\n\nTo get personalized responses, please configure ElevenLabs API key.",
                "audio": None
            }
            
        try:
            logger.info(f"Processing message from user {user_id}: {message[:50]}...")
            
            # Connect to ElevenLabs WebSocket
            headers = {"xi-api-key": self.api_key}
            
            async with websockets.connect(self.websocket_url, extra_headers=headers) as websocket:
                # Prepare context data
                context_data = {
                    "career_counseling": True,
                    "message": message
                }
                
                # Add user context if available
                if user_context:
                    context_data["user_profile"] = {
                        "name": user_context.get("name", ""),
                        "grade_class": user_context.get("grade_class", ""),
                        "expectations": user_context.get("expectations", "")
                    }
                    
                    # Add psychometric data if available
                    if "interests" in user_context:
                        context_data["psychometric_data"] = {
                            "interests": user_context.get("interests", []),
                            "skills": user_context.get("skills", []),
                            "personality_type": user_context.get("personality_type", ""),
                            "aptitude": user_context.get("aptitude", {}),
                            "recommended_careers": user_context.get("recommended_careers", []),
                            "subjects_interested": user_context.get("subjects_interested", [])
                        }
                
                # Initialize conversation with metadata
                init_data = {
                    "type": "client_data",
                    "data": {
                        "conversation_id": self.conversation_id,
                        "user_id": str(user_id),
                        "context": context_data
                    }
                }
                
                await websocket.send(json.dumps(init_data))
                
                # Wait for initialization confirmation
                response = await websocket.recv()
                response_data = json.loads(response)
                
                if response_data.get("type") != "metadata":
                    logger.error(f"Expected metadata response, got: {response_data}")
                    raise Exception(f"Expected metadata response, got: {response_data}")
                
                # Send the user message
                text_message = {
                    "type": "user_audio_chunk",
                    "data": {
                        "is_final": True,
                        "text": message
                    }
                }
                await websocket.send(json.dumps(text_message))
                
                # Process responses
                full_response = ""
                audio_chunks = []
                
                while True:
                    response = await websocket.recv()
                    response_data = json.loads(response)
                    
                    if response_data.get("type") == "agent_response":
                        response_text = response_data.get("data", {}).get("text", "")
                        full_response += response_text
                        logger.debug(f"Received text response: {response_text[:50]}...")
                    
                    elif response_data.get("type") == "audio_response":
                        # Decode base64 audio data
                        audio_data = response_data.get("data", {}).get("audio")
                        if audio_data:
                            audio_chunks.append(base64.b64decode(audio_data))
                            logger.debug("Received audio chunk")
                    
                    # Check if this is the end of the response
                    if response_data.get("data", {}).get("is_final", False):
                        logger.debug("Received final response marker")
                        break
                
                # Combine audio chunks
                combined_audio = b''.join(audio_chunks) if audio_chunks else None
                
                logger.info(f"Completed processing message. Response length: {len(full_response)}")
                
                return {
                    "text": full_response,
                    "audio": combined_audio
                }
                
        except Exception as e:
            logger.error(f"Error in ElevenLabs conversation: {str(e)}")
            return {
                "text": "I'm sorry, I encountered an error processing your request. Please try again.",
                "audio": None
            }
    
    async def end_conversation(self) -> None:
        """Close the conversation with the ElevenLabs agent"""
        logger.info(f"Ending conversation {self.conversation_id}")
        # In a production environment, you might want to send a closing message
        # or perform cleanup operations
