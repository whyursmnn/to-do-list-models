# backend/app/api/komentar_tugas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.komentar_tugas import KomentarTugasCreate, KomentarTugasResponse
from app.crud import komentar_tugas as crud_komentar
from app.crud import tugas as crud_tugas # Untuk validasi tugas_id
from app.core.dependencies import get_current_user, get_current_admin_user # <--- ADD THIS
from app.models.user import User

router = APIRouter()

@router.get("/task/{tugas_id}/comments", response_model=List[KomentarTugasResponse])
async def read_comments_for_task(
    tugas_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mendapatkan semua komentar untuk tugas tertentu."""
    # Otorisasi: Pastikan user memiliki akses ke tugas ini (admin atau ditugaskan)
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to view comments for this task")

    comments = crud_komentar.get_komentar_by_tugas_id(db, tugas_id, skip=skip, limit=limit)
    return comments

@router.post("/comments", response_model=KomentarTugasResponse, status_code=status.HTTP_201_CREATED)
async def create_comment_endpoint(
    komentar: KomentarTugasCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Membuat komentar baru untuk tugas."""
    # Otorisasi: Pastikan user memiliki akses ke tugas ini (admin atau ditugaskan)
    tugas = crud_tugas.get_tugas(db, komentar.tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to comment on this task")

    return crud_komentar.create_komentar_tugas(db=db, komentar=komentar, user_id=current_user.id)

@router.delete("/comments/{komentar_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_comment_endpoint(
    komentar_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa menghapus komentar
):
    """Menghapus komentar tugas (hanya untuk Admin)."""
    if not crud_komentar.delete_komentar_tugas(db, komentar_id):
        raise HTTPException(status_code=404, detail="Comment not found")
    return