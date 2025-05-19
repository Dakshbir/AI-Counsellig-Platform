from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    STUDENT = "STUDENT"
    COUNSELOR = "COUNSELOR"
    ADMIN = "ADMIN"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    grade_class = Column(String)
    contact = Column(String)
    expectations = Column(String)
    role = Column(Enum(UserRole), default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    psychometric_data = relationship("PsychometricData", back_populates="user")
    sessions = relationship("Session", foreign_keys="Session.user_id", back_populates="user")
    career_roadmaps = relationship("CareerRoadmap", back_populates="user")

    

class PsychometricData(Base):
    __tablename__ = "psychometric_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interests = Column(JSON)
    skills = Column(JSON)
    personality_type = Column(String)
    aptitude = Column(JSON)
    recommended_careers = Column(JSON)
    subjects_interested = Column(JSON)  # Added for subjects interested
    report_url = Column(String)  # URL to stored PDF report
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="psychometric_data")

class SessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"

class SessionType(str, enum.Enum):
    AI = "AI"
    HUMAN = "Human"

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    counselor_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # For human counselor sessions
    session_type = Column(Enum(SessionType))
    scheduled_time = Column(DateTime)
    status = Column(Enum(SessionStatus), default=SessionStatus.SCHEDULED)
    transcript = Column(Text)
    summary = Column(Text)
    recording_url = Column(String, nullable=True)  # URL to session recording
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="sessions")
    counselor = relationship("User", foreign_keys=[counselor_id])
    interactions = relationship("SessionInteraction", back_populates="session")

class SessionInteraction(Base):
    __tablename__ = "session_interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("sessions.id"))
    question = Column(Text)
    answer = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("Session", back_populates="interactions")

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    roadmap_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="career_roadmaps")

class ForeignStudyRoadmap(Base):
    __tablename__ = "foreign_study_roadmaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    roadmap_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
