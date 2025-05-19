from app.core.database import Base, engine
from app.models.user import User, PsychometricData, Session, SessionInteraction, CareerRoadmap

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Database tables created!")
