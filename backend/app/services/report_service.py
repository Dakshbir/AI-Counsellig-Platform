import os
import json
import logging
from datetime import datetime
from fastapi import UploadFile
from sqlalchemy.orm import Session
from typing import List
from app.models.user import PsychometricData, CareerRoadmap, ForeignStudyRoadmap, User
from app.services.elevenlabs_service import ElevenLabsConversationalAI

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def upload_psychometric_report(db: Session, user_id: int, file: UploadFile):
    """
    Upload and process a psychometric test report
    """
    try:
        # Check if user exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.error(f"User with ID {user_id} not found")
            return None
        
        # Create directory if it doesn't exist
        os.makedirs("data/reports", exist_ok=True)
        
        # Save file to disk
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        file_location = f"data/reports/{user_id}_{timestamp}.pdf"
        
        with open(file_location, "wb") as f:
            content = await file.read()
            f.write(content)
        
        logger.info(f"Saved psychometric report for user {user_id} at {file_location}")
        
        # Extract data from the PDF (simulated)
        extracted_data = await extract_data_from_pdf(file_location)
        
        # Create psychometric data record
        psychometric_data = PsychometricData(
            user_id=user_id,
            interests=extracted_data["interests"],
            skills=extracted_data["skills"],
            personality_type=extracted_data["personality_type"],
            aptitude=extracted_data["aptitude"],
            recommended_careers=extracted_data["recommended_careers"],
            subjects_interested=extracted_data["subjects_interested"],
            report_url=file_location
        )
        
        db.add(psychometric_data)
        db.commit()
        db.refresh(psychometric_data)
        
        logger.info(f"Psychometric data created for user {user_id}")
        return psychometric_data
        
    except Exception as e:
        logger.error(f"Error processing psychometric report: {str(e)}")
        db.rollback()
        return None

async def extract_data_from_pdf(file_path):
    """
    Extract psychometric data from PDF file
    In a real implementation, this would use a PDF parsing library
    """
    # This is a placeholder for actual PDF parsing logic
    # In a production environment, you would use libraries like PyPDF2, pdfplumber, or
    # a specialized API for extracting structured data from PDFs
    
    # For demonstration, return dummy data
    return {
        "interests": ["Technology", "Science", "Art", "Business"],
        "skills": ["Programming", "Problem Solving", "Communication", "Leadership"],
        "personality_type": "INTJ",
        "aptitude": {
            "verbal": 85,
            "numerical": 90,
            "abstract": 75,
            "spatial": 80,
            "mechanical": 70
        },
        "recommended_careers": [
            "Software Engineer", 
            "Data Scientist", 
            "UX Designer", 
            "Business Analyst",
            "Research Scientist"
        ],
        "subjects_interested": [
            "Computer Science",
            "Mathematics",
            "Physics",
            "Design"
        ]
    }

async def generate_career_roadmap(db: Session, user_id: int):
    """
    Generate a career roadmap based on psychometric data using ElevenLabs
    """
    try:
        # Get latest psychometric data
        psychometric_data = db.query(PsychometricData).filter(
            PsychometricData.user_id == user_id
        ).order_by(PsychometricData.uploaded_at.desc()).first()
        
        if not psychometric_data:
            logger.error(f"No psychometric data found for user {user_id}")
            return None
        
        # Get user details
        user = db.query(User).filter(User.id == user_id).first()
        
        # Create context for the AI
        user_context = {
            "name": user.full_name,
            "grade_class": user.grade_class,
            "expectations": user.expectations,
            "interests": psychometric_data.interests,
            "skills": psychometric_data.skills,
            "personality_type": psychometric_data.personality_type,
            "aptitude": psychometric_data.aptitude,
            "recommended_careers": psychometric_data.recommended_careers,
            "subjects_interested": psychometric_data.subjects_interested
        }
        
        # Use ElevenLabs to generate roadmap
        elevenlabs_ai = ElevenLabsConversationalAI()
        await elevenlabs_ai.start_conversation(user_context)
        
        # Create a specific prompt for roadmap generation
        roadmap_prompt = f"""
        Based on my profile as a {user_context['grade_class']} student with interests in {', '.join(user_context['interests'][:3])}, 
        skills in {', '.join(user_context['skills'][:3])}, and a {user_context['personality_type']} personality type,
        please create a detailed career roadmap with the following sections:
        1. Short-term goals (next 1-2 years)
        2. Medium-term goals (3-5 years)
        3. Long-term career path
        4. Educational requirements
        5. Skill development recommendations
        6. Potential challenges and how to overcome them
        
        Format the response as a structured JSON object with these exact keys: short_term_goals, medium_term_goals, 
        long_term_career_path, educational_requirements, skill_development, potential_challenges.
        """
        
        response = await elevenlabs_ai.process_message(roadmap_prompt, user_id, user_context)
        
        # Try to parse the response as JSON
        try:
            # Extract JSON from the text response
            json_text = response["text"]
            # Find JSON-like content between curly braces
            start_idx = json_text.find('{')
            end_idx = json_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_content = json_text[start_idx:end_idx]
                roadmap_data = json.loads(json_content)
            else:
                # If no JSON structure found, create a structured format
                roadmap_data = {
                    "short_term_goals": json_text.split("Short-term goals")[1].split("Medium-term goals")[0].strip() if "Short-term goals" in json_text else "",
                    "medium_term_goals": json_text.split("Medium-term goals")[1].split("Long-term career path")[0].strip() if "Medium-term goals" in json_text else "",
                    "long_term_career_path": json_text.split("Long-term career path")[1].split("Educational requirements")[0].strip() if "Long-term career path" in json_text else "",
                    "educational_requirements": json_text.split("Educational requirements")[1].split("Skill development")[0].strip() if "Educational requirements" in json_text else "",
                    "skill_development": json_text.split("Skill development")[1].split("Potential challenges")[0].strip() if "Skill development" in json_text else "",
                    "potential_challenges": json_text.split("Potential challenges")[1].strip() if "Potential challenges" in json_text else ""
                }
        except Exception as e:
            logger.error(f"Error parsing roadmap JSON: {str(e)}")
            # If JSON parsing fails, create a simple structure
            roadmap_data = {
                "roadmap_text": response["text"],
                "error": str(e)
            }
        
        # Create roadmap record
        roadmap = CareerRoadmap(
            user_id=user_id,
            roadmap_data=roadmap_data
        )
        
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        
        logger.info(f"Career roadmap generated for user {user_id}")
        return roadmap
        
    except Exception as e:
        logger.error(f"Error generating career roadmap: {str(e)}")
        db.rollback()
        return None

async def generate_foreign_study_roadmap(db: Session, user_id: int, target_countries: List[str]):
    """
    Generate a foreign study roadmap based on psychometric data and target countries
    """
    try:
        # Get latest psychometric data
        psychometric_data = db.query(PsychometricData).filter(
            PsychometricData.user_id == user_id
        ).order_by(PsychometricData.uploaded_at.desc()).first()
        
        if not psychometric_data:
            logger.error(f"No psychometric data found for user {user_id}")
            return None
        
        # Get user details
        user = db.query(User).filter(User.id == user_id).first()
        
        # Create context for the AI
        user_context = {
            "name": user.full_name,
            "grade_class": user.grade_class,
            "expectations": user.expectations,
            "interests": psychometric_data.interests,
            "skills": psychometric_data.skills,
            "personality_type": psychometric_data.personality_type,
            "aptitude": psychometric_data.aptitude,
            "recommended_careers": psychometric_data.recommended_careers,
            "subjects_interested": psychometric_data.subjects_interested,
            "target_countries": target_countries
        }
        
        # Use ElevenLabs to generate roadmap
        elevenlabs_ai = ElevenLabsConversationalAI()
        await elevenlabs_ai.start_conversation(user_context)
        
        # Create a specific prompt for foreign study roadmap generation
        countries_str = ", ".join(target_countries)
        roadmap_prompt = f"""
        Based on my profile as a {user_context['grade_class']} student interested in studying in {countries_str},
        with interests in {', '.join(user_context['interests'][:3])}, skills in {', '.join(user_context['skills'][:3])},
        and recommended careers including {', '.join(user_context['recommended_careers'][:3])},
        please create a detailed foreign study roadmap with the following sections:
        
        1. Application requirements and timeline for each country
        2. Recommended universities and programs
        3. Standardized tests and language requirements
        4. Scholarship opportunities
        5. Visa process overview
        6. Estimated costs and financial planning
        7. Cultural adaptation tips
        
        Format the response as a structured JSON object with these exact keys: application_requirements, 
        recommended_universities, standardized_tests, scholarship_opportunities, visa_process, 
        estimated_costs, cultural_adaptation.
        """
        
        response = await elevenlabs_ai.process_message(roadmap_prompt, user_id, user_context)
        
        # Try to parse the response as JSON
        try:
            # Extract JSON from the text response
            json_text = response["text"]
            # Find JSON-like content between curly braces
            start_idx = json_text.find('{')
            end_idx = json_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_content = json_text[start_idx:end_idx]
                roadmap_data = json.loads(json_content)
            else:
                # If no JSON structure found, create a structured format
                roadmap_data = {
                    "application_requirements": extract_section(json_text, "Application requirements"),
                    "recommended_universities": extract_section(json_text, "Recommended universities"),
                    "standardized_tests": extract_section(json_text, "Standardized tests"),
                    "scholarship_opportunities": extract_section(json_text, "Scholarship opportunities"),
                    "visa_process": extract_section(json_text, "Visa process"),
                    "estimated_costs": extract_section(json_text, "Estimated costs"),
                    "cultural_adaptation": extract_section(json_text, "Cultural adaptation")
                }
        except Exception as e:
            logger.error(f"Error parsing foreign study roadmap JSON: {str(e)}")
            roadmap_data = {
                "roadmap_text": response["text"],
                "error": str(e)
            }
        
        # Add target countries to the roadmap data
        roadmap_data["target_countries"] = target_countries
        
        # Create foreign study roadmap record
        roadmap = ForeignStudyRoadmap(
            user_id=user_id,
            roadmap_data=roadmap_data
        )
        
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)
        
        logger.info(f"Foreign study roadmap generated for user {user_id}")
        return roadmap
        
    except Exception as e:
        logger.error(f"Error generating foreign study roadmap: {str(e)}")
        db.rollback()
        return None

def extract_section(text, section_name):
    """Helper function to extract sections from text"""
    try:
        start_idx = text.find(section_name)
        if start_idx == -1:
            return ""
            
        # Find the next section
        next_sections = ["Application requirements", "Recommended universities", 
                        "Standardized tests", "Scholarship opportunities", 
                        "Visa process", "Estimated costs", "Cultural adaptation"]
        next_sections.remove(section_name)
        
        end_idx = len(text)
        for next_section in next_sections:
            next_idx = text.find(next_section, start_idx + len(section_name))
            if next_idx != -1 and next_idx < end_idx:
                end_idx = next_idx
        
        # Extract the content
        content = text[start_idx + len(section_name):end_idx].strip()
        return content
    except Exception:
        return ""

def get_user_roadmaps(db: Session, user_id: int):
    """
    Get all career roadmaps for a user
    """
    return db.query(CareerRoadmap).filter(CareerRoadmap.user_id == user_id).order_by(CareerRoadmap.created_at.desc()).all()

def get_user_foreign_study_roadmaps(db: Session, user_id: int):
    """
    Get all foreign study roadmaps for a user
    """
    return db.query(ForeignStudyRoadmap).filter(ForeignStudyRoadmap.user_id == user_id).order_by(ForeignStudyRoadmap.created_at.desc()).all()
