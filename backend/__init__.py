import os
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

# Lấy api key
api_key = os.getenv("GEMINI_API_KEY")