from datetime import datetime

from backend import db


class FactCheck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text_checked = db.Column(db.Text, nullable=False)
    label = db.Column(db.String(50), nullable=False)
    summary = db.Column(db.Text, nullable=True)
    source = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<FactCheck {self.id}: {self.label}>'
