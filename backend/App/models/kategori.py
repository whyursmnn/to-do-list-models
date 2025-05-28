
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class Kategori(Base):
    __tablename__ = "kategori" # Table name 'Kategori'

    id = Column(Integer, primary_key=True, index=True)
    nama = Column(String(100), nullable=False) # Field name 'nama'
    deskripsi = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    created_by_user = relationship("User", back_populates="created_categories", foreign_keys=[created_by])
    updated_by_user = relationship("User", back_populates="updated_categories", foreign_keys=[updated_by])
    tasks = relationship("Tugas", back_populates="kategori")