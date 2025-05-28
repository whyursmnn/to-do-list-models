
from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class KomentarTugas(Base):
    __tablename__ = "komentar_tugas" # Table name 'KomentarTugas'

    id = Column(Integer, primary_key=True, index=True)
    tugas_id = Column(Integer, ForeignKey("tugas.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    komentar = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tugas = relationship("Tugas", back_populates="komentar_tugas")
    user = relationship("User", back_populates="comments")