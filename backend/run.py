import uvicorn
from app.init_db import init_db

if __name__ == "__main__":
    # Initialize database tables
    init_db()
    
    # Run the FastAPI server
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
