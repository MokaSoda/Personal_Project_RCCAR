from flask_sqlalchemy import SQLAlchemy
from RemoteCAR import db
from datetime import datetime
from sqlalchemy.dialects.mysql import LONGTEXT

class Image(db.Model):
    uuid = db.Column(db.String(36), primary_key=True)
    image_data = db.Column(LONGTEXT, nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.now())
    captured_user = db.Column(db.String(150), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)