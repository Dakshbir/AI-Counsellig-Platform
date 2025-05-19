import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """Send an email using configured SMTP settings"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.EMAIL_SENDER
        message["To"] = to_email
        
        # Add HTML content
        html_part = MIMEText(html_content, "html")
        message.attach(html_part)
        
        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.EMAIL_HOST, settings.EMAIL_PORT) as server:
            server.starttls()
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.sendmail(settings.EMAIL_SENDER, to_email, message.as_string())
            
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

async def send_session_confirmation(to_email: str, session_data: dict) -> bool:
    """Send session confirmation email"""
    session_time = session_data["scheduled_time"].strftime("%A, %B %d, %Y at %I:%M %p")
    session_type = session_data["session_type"]
    
    html_content = f"""
    <html>
    <body>
        <h2>Your Counseling Session is Confirmed</h2>
        <p>Dear {session_data['user_name']},</p>
        <p>Your {session_type} counseling session has been scheduled for:</p>
        <p><strong>{session_time}</strong></p>
        
        <h3>Session Details:</h3>
        <ul>
            <li><strong>Session ID:</strong> {session_data['id']}</li>
            <li><strong>Type:</strong> {session_type} Counseling</li>
        </ul>
        
        <p>You will receive a reminder 5 minutes before your session.</p>
        
        <p>To join your session, simply log in to your account at the scheduled time and navigate to the "My Sessions" page.</p>
        
        <p>Thank you for choosing our AI Counseling Platform!</p>
    </body>
    </html>
    """
    
    subject = f"Confirmation: {session_type} Counseling Session - {session_time}"
    return await send_email(to_email, subject, html_content)

async def send_session_reminder(to_email: str, session_data: dict) -> bool:
    """Send session reminder email"""
    session_time = session_data["scheduled_time"].strftime("%I:%M %p")
    session_type = session_data["session_type"]
    
    html_content = f"""
    <html>
    <body>
        <h2>Your Counseling Session Starts Soon</h2>
        <p>Dear {session_data['user_name']},</p>
        <p>This is a reminder that your {session_type} counseling session is scheduled to begin at <strong>{session_time}</strong> (in 5 minutes).</p>
        
        <p>To join your session, please log in to your account and navigate to the "My Sessions" page.</p>
        
        <p>Thank you for choosing our AI Counseling Platform!</p>
    </body>
    </html>
    """
    
    subject = f"Reminder: Your Counseling Session Starts in 5 Minutes"
    return await send_email(to_email, subject, html_content)

async def send_session_summary(to_email: str, session_data: dict) -> bool:
    """Send session summary email with roadmap"""
    session_time = session_data["scheduled_time"].strftime("%A, %B %d, %Y")
    
    html_content = f"""
    <html>
    <body>
        <h2>Your Counseling Session Summary</h2>
        <p>Dear {session_data['user_name']},</p>
        <p>Thank you for attending your counseling session on <strong>{session_time}</strong>.</p>
        
        <h3>Session Summary:</h3>
        <p>{session_data['summary']}</p>
        
        <h3>Next Steps:</h3>
        <p>We've attached your personalized career roadmap to this email. Please review it and feel free to schedule a follow-up session if you have any questions.</p>
        
        <p>Thank you for choosing our AI Counseling Platform!</p>
    </body>
    </html>
    """
    
    subject = f"Your Counseling Session Summary and Career Roadmap"
    return await send_email(to_email, subject, html_content)
