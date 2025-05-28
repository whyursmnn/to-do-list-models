# backend/app/crud/tugas.py
from sqlalchemy.orm import Session, joinedload
from app.models.tugas import Tugas, PenugasanTugas, RiwayatStatusTugas
from app.schemas.tugas import TugasCreate, TugasUpdate, StatusEnum
from typing import List, Optional

def get_tugas(db: Session, tugas_id: int):
    return db.query(Tugas)\
             .options(joinedload(Tugas.kategori))\
             .options(joinedload(Tugas.dibuat_oleh_user))\
             .options(joinedload(Tugas.updated_by_user))\
             .options(joinedload(Tugas.penugasan_tugas).joinedload(PenugasanTugas.pegawai_user))\
             .filter(Tugas.id == tugas_id, Tugas.is_deleted == False).first()

def get_all_tugas(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Tugas)\
             .options(joinedload(Tugas.kategori))\
             .options(joinedload(Tugas.dibuat_oleh_user))\
             .options(joinedload(Tugas.updated_by_user))\
             .options(joinedload(Tugas.penugasan_tugas).joinedload(PenugasanTugas.pegawai_user))\
             .filter(Tugas.is_deleted == False).offset(skip).limit(limit).all()

def get_tugas_by_pegawai_id(db: Session, pegawai_id: int, skip: int = 0, limit: int = 100):
    return db.query(Tugas)\
             .join(PenugasanTugas)\
             .filter(PenugasanTugas.pegawai_id == pegawai_id, Tugas.is_deleted == False)\
             .options(joinedload(Tugas.kategori))\
             .options(joinedload(Tugas.dibuat_oleh_user))\
             .options(joinedload(Tugas.updated_by_user))\
             .options(joinedload(Tugas.penugasan_tugas).joinedload(PenugasanTugas.pegawai_user))\
             .offset(skip).limit(limit).all()

def create_tugas(db: Session, tugas: TugasCreate, dibuat_oleh_user_id: int):
    db_tugas = Tugas(
        judul=tugas.judul,
        deskripsi=tugas.deskripsi,
        prioritas=tugas.prioritas,
        status=tugas.status,
        tanggal_mulai=tugas.tanggal_mulai,
        tanggal_selesai=tugas.tanggal_selesai,
        kategori_id=tugas.kategori_id,
        dibuat_oleh=dibuat_oleh_user_id
    )
    db.add(db_tugas)
    db.flush() # Mendapatkan ID tugas sebelum commit untuk penugasan

    if tugas.pegawai_ids:
        for pegawai_id in set(tugas.pegawai_ids): # Pastikan ID unik
            db_penugasan = PenugasanTugas(tugas_id=db_tugas.id, pegawai_id=pegawai_id)
            db.add(db_penugasan)

    db.commit()
    db.refresh(db_tugas)
    return db_tugas

def update_tugas(db: Session, tugas_id: int, tugas_update: TugasUpdate, updated_by_user_id: int):
    db_tugas = get_tugas(db, tugas_id)
    if not db_tugas:
        return None

    # Catat riwayat status jika status berubah
    old_status = db_tugas.status
    
    update_data = tugas_update.dict(exclude_unset=True, exclude={"pegawai_ids"})
    for key, value in update_data.items():
        setattr(db_tugas, key, value)
    
    db_tugas.updated_by = updated_by_user_id

    # Update penugasan pegawai
    if tugas_update.pegawai_ids is not None:
        # Hapus penugasan lama
        db.query(PenugasanTugas).filter(PenugasanTugas.tugas_id == tugas_id).delete()
        # Tambah penugasan baru
        for pegawai_id in set(tugas_update.pegawai_ids):
            db_penugasan = PenugasanTugas(tugas_id=db_tugas.id, pegawai_id=pegawai_id)
            db.add(db_penugasan)
    
    db.commit()
    db.refresh(db_tugas)

    # Catat riwayat status setelah commit tugas utama
    if old_status != db_tugas.status:
        db_riwayat = RiwayatStatusTugas(
            tugas_id=db_tugas.id,
            status_lama=old_status,
            status_baru=db_tugas.status,
            diubah_oleh=updated_by_user_id
        )
        db.add(db_riwayat)
        db.commit() # Commit riwayat status secara terpisah
        db.refresh(db_riwayat)

    return db_tugas

def soft_delete_tugas(db: Session, tugas_id: int):
    db_tugas = get_tugas(db, tugas_id)
    if not db_tugas:
        return False
    db_tugas.is_deleted = True
    db.commit()
    db.refresh(db_tugas)
    return True