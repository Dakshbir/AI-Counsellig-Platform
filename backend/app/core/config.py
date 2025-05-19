import os
from pydantic import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Counselling Platform"
    
    # CORS settings
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]
    
    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/ai_counselling")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-for-jwt")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # ElevenLabs API settings
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "your-elevenlabs-api-key")
    ELEVENLABS_AGENT_ID: str = os.getenv("ELEVENLABS_AGENT_ID", "your-agent-id")
    
    # Email settings
    EMAIL_SENDER: str = os.getenv("EMAIL_SENDER", "noreply@aicounselling.com")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "your-email-password")
    EMAIL_HOST: str = os.getenv("EMAIL_HOST", "smtp.example.com")
    EMAIL_PORT: int = int(os.getenv("EMAIL_PORT", "587"))
    
    # Session settings
    SESSION_REMINDER_MINUTES: int = 5
    
    # Data retention settings
    DATA_RETENTION_DAYS: int = 365 * 4  # 4 years by default

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
