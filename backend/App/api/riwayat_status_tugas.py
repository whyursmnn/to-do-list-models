# backend/app/api/riwayat_status_tugas.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.riwayat_status_tugas import RiwayatStatusTugasResponse
from app.crud import riwayat_status_tugas as crud_riwayat
from app.crud import tugas as crud_tugas # Untuk validasi tugas_id
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/task/{tugas_id}/status-history", response_model=List[RiwayatStatusTugasResponse])
async def read_status_history_for_task(
    tugas_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mendapatkan riwayat status tugas untuk tugas tertentu."""
    # Otorisasi: Pastikan user memiliki akses ke tugas ini (admin atau ditugaskan)
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to view status history for this task")

    history = crud_riwayat.get_riwayat_by_tugas_id(db, tugas_id, skip=skip, limit=limit)
    return history