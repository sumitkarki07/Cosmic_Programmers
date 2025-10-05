from dotenv import load_dotenv
import os

load_dotenv()

class Config:
    METEOMATICS_API_USERNAME = os.getenv('METEOMATICS_API_USERNAME')
    METEOMATICS_API_PASSWORD = os.getenv('METEOMATICS_API_PASSWORD')
    DEBUG = True
    CORS_HEADERS = 'Content-Type'