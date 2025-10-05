from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    METEOMATICS_API_USERNAME = os.getenv('METEOMATICS_API_USERNAME')
    METEOMATICS_API_PASSWORD = os.getenv('METEOMATICS_API_PASSWORD')
    METEOMATICS_API_URL = os.getenv('METEOMATICS_API_URL', 'https://api.meteomatics.com')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    CORS_HEADERS = 'Content-Type'