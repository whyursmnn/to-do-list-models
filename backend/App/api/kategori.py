# backend/app/api/kategori.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.kategori import KategoriCreate, KategoriResponse, KategoriUpdate
from app.crud import kategori as crud_kategori
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User # Untuk type hinting user

router = APIRouter()

@router.get("/", response_model=List[KategoriResponse])
async def read_kategoris(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user) # Semua role bisa melihat kategori
):
    kategoris = crud_kategori.get_kategoris(db, skip=skip, limit=limit)
    return kategoris

@router.post("/", response_model=KategoriResponse, status_code=status.HTTP_201_CREATED)
async def create_kategori_endpoint(
    kategori: KategoriCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa membuat kategori
):
    db_kategori = crud_kategori.get_kategori_by_nama(db, nama=kategori.nama)
    if db_kategori:
        raise HTTPException(status_code=400, detail="Category name already exists")
    return crud_kategori.create_kategori(db=db, kategori=kategori, created_by_user_id=current_user.id)

@router.put("/{kategori_id}", response_model=KategoriResponse)
async def update_kategori_endpoint(
    kategori_id: int, kategori_update: KategoriUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa update
):
    updated_kategori = crud_kategori.update_kategori(db, kategori_id, kategori_update, updated_by_user_id=current_user.id)
    if not updated_kategori:
        raise HTTPException(status_code=404, detail="Category not found")
    return updated_kategori

@router.delete("/{kategori_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_kategori_endpoint(
    kategori_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa menghapus
):
    if not crud_kategori.soft_delete_kategori(db, kategori_id):
        raise HTTPException(status_code=404, detail="Category not found")
    return