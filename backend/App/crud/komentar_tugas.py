# backend/app/crud/komentar_tugas.py
from sqlalchemy.orm import Session, joinedload
from app.models.komentar_tugas import KomentarTugas
from app.schemas.komentar_tugas import KomentarTugasCreate
from typing import List

def get_komentar_tugas(db: Session, komentar_id: int):
    return db.query(KomentarTugas).filter(KomentarTugas.id == komentar_id).first()

def get_komentar_by_tugas_id(db: Session, tugas_id: int, skip: int = 0, limit: int = 100):
    return db.query(KomentarTugas)\
             .options(joinedload(KomentarTugas.user))\
             .filter(KomentarTugas.tugas_id == tugas_id)\
             .offset(skip).limit(limit).all()

def create_komentar_tugas(db: Session, komentar: KomentarTugasCreate, user_id: int):
    db_komentar = KomentarTugas(
        tugas_id=komentar.tugas_id,
        user_id=user_id,
        komentar=komentar.komentar
    )
    db.add(db_komentar)
    db.commit()
    db.refresh(db_komentar)
    return db_komentar

def delete_komentar_tugas(db: Session, komentar_id: int):
    db_komentar = get_komentar_tugas(db, komentar_id)
    if not db_komentar:
        return False
    db.delete(db_komentar)
    db.commit()
    return True