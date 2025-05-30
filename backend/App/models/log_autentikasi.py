# backend/app/models/log_autentikasi.py
from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class LogAutentikasi(Base):
    __tablename__ = "log_autentikasi" 

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    login_time = Column(DateTime, default=datetime.utcnow)
    logout_time = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="auth_logs")