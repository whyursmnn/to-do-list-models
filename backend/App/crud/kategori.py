# backend/app/crud/kategori.py
from sqlalchemy.orm import Session
from app.models.kategori import Kategori
from app.schemas.kategori import KategoriCreate, KategoriUpdate

def get_kategori(db: Session, kategori_id: int):
    return db.query(Kategori).filter(Kategori.id == kategori_id, Kategori.is_deleted == False).first()

def get_kategori_by_nama(db: Session, nama: str):
    return db.query(Kategori).filter(Kategori.nama == nama, Kategori.is_deleted == False).first()

def get_kategoris(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Kategori).filter(Kategori.is_deleted == False).offset(skip).limit(limit).all()

def create_kategori(db: Session, kategori: KategoriCreate, created_by_user_id: int):
    db_kategori = Kategori(
        nama=kategori.nama,
        deskripsi=kategori.deskripsi,
        created_by=created_by_user_id
    )
    db.add(db_kategori)
    db.commit()
    db.refresh(db_kategori)
    return db_kategori

def update_kategori(db: Session, kategori_id: int, kategori_update: KategoriUpdate, updated_by_user_id: int):
    db_kategori = get_kategori(db, kategori_id)
    if not db_kategori:
        return None
    
    update_data = kategori_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_kategori, key, value)
    
    db_kategori.updated_by = updated_by_user_id
    db.commit()
    db.refresh(db_kategori)
    return db_kategori

def soft_delete_kategori(db: Session, kategori_id: int):
    db_kategori = get_kategori(db, kategori_id)
    if not db_kategori:
        return False
    db_kategori.is_deleted = True
    db.commit()
    db.refresh(db_kategori)
    return True