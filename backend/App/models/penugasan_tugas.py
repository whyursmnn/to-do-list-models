from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class PenugasanTugas(Base):
    __tablename__ = "penugasan_tugas" # Table name 'PenugasanTugas'

    id = Column(Integer, primary_key=True, index=True)
    tugas_id = Column(Integer, ForeignKey("tugas.id"), nullable=False)
    pegawai_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationships
    tugas = relationship("Tugas", back_populates="penugasan_tugas")
    pegawai_user = relationship("User", back_populates="task_assignments")