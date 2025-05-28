# backend/app/crud/riwayat_status_tugas.py
from sqlalchemy.orm import Session, joinedload
from app.models.riwayat_status_tugas import RiwayatStatusTugas
from app.schemas.riwayat_status_tugas import RiwayatStatusTugasCreate
from typing import List

def get_riwayat_status_tugas(db: Session, riwayat_id: int):
    return db.query(RiwayatStatusTugas).filter(RiwayatStatusTugas.id == riwayat_id).first()

def get_riwayat_by_tugas_id(db: Session, tugas_id: int, skip: int = 0, limit: int = 100):
    return db.query(RiwayatStatusTugas)\
             .options(joinedload(RiwayatStatusTugas.diubah_oleh_user))\
             .filter(RiwayatStatusTugas.tugas_id == tugas_id)\
             .order_by(RiwayatStatusTugas.waktu_ubah.desc())\
             .offset(skip).limit(limit).all()

def create_riwayat_status_tugas(db: Session, riwayat: RiwayatStatusTugasCreate, diubah_oleh_user_id: int):
    db_riwayat = RiwayatStatusTugas(
        tugas_id=riwayat.tugas_id,
        status_lama=riwayat.status_lama,
        status_baru=riwayat.status_baru,
        diubah_oleh=diubah_oleh_user_id
    )
    db.add(db_riwayat)
    db.commit()
    db.refresh(db_riwayat)
    return db_riwayat