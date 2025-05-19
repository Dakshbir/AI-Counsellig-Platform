from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.models.user import UserRole, SessionStatus, SessionType

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    grade_class: str
    contact: str
    expectations: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: UserRole = UserRole.STUDENT

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    grade_class: Optional[str] = None
    contact: Optional[str] = None
    expectations: Optional[str] = None
    password: Optional[str] = None

class UserInDB(UserBase):
    id: int
    role: UserRole
    is_active: bool
    created_at: datetime
    
    class Config:
        orm_mode = True

class User(UserInDB):
    pass

# Token schemas
class Token(BaseModel):
    token: str
    token_type: str
    user: User

# Psychometric data schemas
class PsychometricDataBase(BaseModel):
    interests: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    personality_type: Optional[str] = None
    aptitude: Optional[Dict[str, Any]] = None
    recommended_careers: Optional[List[str]] = None
    subjects_interested: Optional[List[str]] = None

class PsychometricDataCreate(PsychometricDataBase):
    user_id: int
    report_url: Optional[str] = None

class PsychometricData(PsychometricDataBase):
    id: int
    user_id: int
    report_url: Optional[str] = None
    uploaded_at: datetime
    
    class Config:
        orm_mode = True

# Session schemas
class SessionBase(BaseModel):
    session_type: SessionType
    scheduled_time: datetime
    status: SessionStatus = SessionStatus.SCHEDULED

class SessionCreate(SessionBase):
    user_id: int
    counselor_id: Optional[int] = None

class SessionUpdate(BaseModel):
    status: Optional[SessionStatus] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None

class Session(SessionBase):
    id: int
    user_id: int
    counselor_id: Optional[int] = None
    transcript: Optional[str] = None
    summary: Optional[str] = None
    recording_url: Optional[str] = None
    created_at: datetime
    
    class Config:
        orm_mode = True

# Session interaction schemas
class SessionInteractionBase(BaseModel):
    question: str
    answer: str

class SessionInteractionCreate(BaseModel):
    session_id: int
    question: str
    answer: Optional[str] = None

class SessionInteraction(SessionInteractionBase):
    id: int
    session_id: int
    timestamp: datetime
    
    class Config:
        orm_mode = True

# Career roadmap schemas
class CareerRoadmapBase(BaseModel):
    roadmap_data: Dict[str, Any]

class CareerRoadmapCreate(CareerRoadmapBase):
    user_id: int

class CareerRoadmap(CareerRoadmapBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Foreign study roadmap schemas
class ForeignStudyRoadmapBase(BaseModel):
    roadmap_data: Dict[str, Any]

class ForeignStudyRoadmapCreate(ForeignStudyRoadmapBase):
    user_id: int

class ForeignStudyRoadmap(ForeignStudyRoadmapBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True
