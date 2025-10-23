import os
from flask_sqlalchemy import SQLAlchemy

# Chỉ khởi tạo đối tượng SQLAlchemy, không import app
db = SQLAlchemy()

# Lấy api key
api_key = os.getenv("GEMINI_API_KEY")