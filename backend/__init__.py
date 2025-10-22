import os
from flask_sqlalchemy import SQLAlchemy
from backend.app import app

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRES_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

api_key = os.getenv("GEMINI_API_KEY")