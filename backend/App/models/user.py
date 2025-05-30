from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(100), nullable=False)
    role = Column(Enum("admin", "pegawai"), default="pegawai", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

   # Relationships
    created_categories = relationship("Kategori", back_populates="created_by_user", foreign_keys="[Kategori.created_by]")
    updated_categories = relationship("Kategori", back_populates="updated_by_user", foreign_keys="[Kategori.updated_by]")
    created_tasks = relationship("Tugas", back_populates="dibuat_oleh_user", foreign_keys="[Tugas.dibuat_oleh]")
    updated_tasks = relationship("Tugas", back_populates="updated_by_user", foreign_keys="[Tugas.updated_by]")
    task_assignments = relationship("PenugasanTugas", back_populates="pegawai_user")
    comments = relationship("KomentarTugas", back_populates="user")
    attachments = relationship("LampiranTugas", back_populates="uploaded_by_user")
    status_histories = relationship("RiwayatStatusTugas", back_populates="diubah_oleh_user")
    auth_logs = relationship("LogAutentikasi", back_populates="user")