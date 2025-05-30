
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class LampiranTugas(Base):
    __tablename__ = "lampiran_tugas" 

    id = Column(Integer, primary_key=True, index=True)
    tugas_id = Column(Integer, ForeignKey("tugas.id"), nullable=False)
    file_url = Column(String(255), nullable=True)
    deskripsi = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tugas = relationship("Tugas", back_populates="lampiran_tugas")
    uploaded_by_user = relationship("User", back_populates="attachments")