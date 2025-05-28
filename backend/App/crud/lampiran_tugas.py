# backend/app/crud/lampiran_tugas.py
from sqlalchemy.orm import Session, joinedload
from app.models.lampiran_tugas import LampiranTugas
from app.schemas.lampiran_tugas import LampiranTugasCreate
from typing import List, Optional

def get_lampiran_tugas(db: Session, lampiran_id: int) -> Optional[LampiranTugas]:
    """Mendapatkan lampiran tugas berdasarkan ID."""
    return db.query(LampiranTugas).filter(LampiranTugas.id == lampiran_id).first()

def get_lampiran_by_tugas_id(db: Session, tugas_id: int, skip: int = 0, limit: int = 100) -> List[LampiranTugas]:
    """Mendapatkan semua lampiran untuk tugas tertentu."""
    return db.query(LampiranTugas)\
             .options(joinedload(LampiranTugas.uploaded_by_user))\
             .filter(LampiranTugas.tugas_id == tugas_id)\
             .order_by(LampiranTugas.uploaded_at.desc())\
             .offset(skip).limit(limit).all()

def create_lampiran_tugas(db: Session, lampiran: LampiranTugasCreate, uploaded_by_user_id: int) -> LampiranTugas:
    """Membuat lampiran baru untuk tugas."""
    db_lampiran = LampiranTugas(
        tugas_id=lampiran.tugas_id,
        file_url=lampiran.file_url,
        deskripsi=lampiran.deskripsi,
        uploaded_by=uploaded_by_user_id
    )
    db.add(db_lampiran)
    db.commit()
    db.refresh(db_lampiran)
    return db_lampiran

def delete_lampiran_tugas(db: Session, lampiran_id: int) -> bool:
    """Menghapus lampiran tugas."""
    db_lampiran = get_lampiran_tugas(db, lampiran_id)
    if not db_lampiran:
        return False
    db.delete(db_lampiran)
    db.commit()
    return True