
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime, date

class Tugas(Base):
    __tablename__ = "tugas" # Table name 'Tugas'

    id = Column(Integer, primary_key=True, index=True)
    judul = Column(String(255), nullable=False) # Field name 'judul'
    deskripsi = Column(Text, nullable=True)
    prioritas = Column(Enum('low', 'medium', 'high'), default='medium', nullable=False) # Enum type
    status = Column(Enum('to_do', 'in_progress', 'done', 'archived'), default='to_do', nullable=False) # Enum type
    tanggal_mulai = Column(Date, nullable=True) # Date type
    tanggal_selesai = Column(Date, nullable=True) # Date type
    kategori_id = Column(Integer, ForeignKey("kategori.id"), nullable=True)
    dibuat_oleh = Column(Integer, ForeignKey("users.id"), nullable=False) # Field name 'dibuat_oleh'
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)

    # Relationships
    kategori = relationship("Kategori", back_populates="tasks")
    dibuat_oleh_user = relationship("User", back_populates="created_tasks", foreign_keys=[dibuat_oleh])
    updated_by_user = relationship("User", back_populates="updated_tasks", foreign_keys=[updated_by])
    penugasan_tugas = relationship("PenugasanTugas", back_populates="tugas")
    komentar_tugas = relationship("KomentarTugas", back_populates="tugas")
    lampiran_tugas = relationship("LampiranTugas", back_populates="tugas")
    riwayat_status_tugas = relationship("RiwayatStatusTugas", back_populates="tugas")