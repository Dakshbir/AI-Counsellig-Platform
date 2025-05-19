import logging
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100, role: UserRole = None):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    return query.offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    try:
        logger.debug(f"Creating user with email: {user.email}")
        hashed_password = get_password_hash(user.password)
        db_user = User(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            grade_class=user.grade_class,
            contact=user.contact,
            expectations=user.expectations,
            role=user.role
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.debug(f"User created successfully: {user.email}")
        return db_user
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        db.rollback()
        raise

def update_user(db: Session, user_id: int, user: UserUpdate):
    try:
        db_user = get_user(db, user_id)
        if not db_user:
            logger.error(f"User {user_id} not found")
            return None
            
        update_data = user.dict(exclude_unset=True)
        
        if "password" in update_data:
            update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
        
        for key, value in update_data.items():
            setattr(db_user, key, value)
        
        db.commit()
        db.refresh(db_user)
        logger.info(f"User {user_id} updated successfully")
        return db_user
    except Exception as e:
        logger.error(f"Error updating user {user_id}: {str(e)}")
        db.rollback()
        raise

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def get_counselors(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.role == UserRole.COUNSELOR).offset(skip).limit(limit).all()
