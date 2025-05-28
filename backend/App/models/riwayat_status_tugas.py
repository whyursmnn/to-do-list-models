
from sqlalchemy import Column, Integer, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime

class RiwayatStatusTugas(Base):
    __tablename__ = "riwayat_status_tugas" # Table name 'RiwayatStatusTugas'

    id = Column(Integer, primary_key=True, index=True)
    tugas_id = Column(Integer, ForeignKey("tugas.id"), nullable=False)
    status_lama = Column(Enum('to_do', 'in_progress', 'done', 'archived'), nullable=True)
    status_baru = Column(Enum('to_do', 'in_progress', 'done', 'archived'), nullable=True)
    diubah_oleh = Column(Integer, ForeignKey("users.id"), nullable=False)
    waktu_ubah = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tugas = relationship("Tugas", back_populates="riwayat_status_tugas")
    diubah_oleh_user = relationship("User", back_populates="status_histories")