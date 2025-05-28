# backend/app/api/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.schemas.tugas import TugasCreate, TugasUpdate, TugasResponse
from app.crud import tugas as crud_tugas
from app.crud import user as crud_user # Untuk validasi user IDs
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User # Untuk type hinting user

router = APIRouter()

@router.get("/", response_model=List[TugasResponse])
async def read_tasks(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mendapatkan daftar tugas (Admin melihat semua, Pegawai melihat tugasnya sendiri)."""
    if current_user.role == "admin":
        tasks = crud_tugas.get_all_tugas(db, skip=skip, limit=limit)
    else: # Pegawai hanya bisa melihat tugas yang ditugaskan kepadanya
        tasks = crud_tugas.get_tugas_by_pegawai_id(db, pegawai_id=current_user.id, skip=skip, limit=limit)
    return tasks

@router.post("/", response_model=TugasResponse, status_code=status.HTTP_201_CREATED)
async def create_task_endpoint(
    tugas: TugasCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Membuat tugas baru."""
    # Validasi bahwa semua pegawai_ids yang diberikan benar-benar ada
    for pegawai_id in tugas.pegawai_ids:
        if not crud_user.get_user(db, pegawai_id):
            raise HTTPException(status_code=400, detail=f"Pegawai dengan ID {pegawai_id} tidak ditemukan.")

    # Logika bisnis: pegawai bisa membuat tugas untuk diri sendiri atau menugaskan ke user lain
    # Admin bisa membuat tugas dan menugaskan ke siapa saja
    if current_user.role == "pegawai":
        # Jika pegawai membuat tugas tanpa menugaskannya ke diri sendiri, paksa menugaskan ke diri sendiri
        if not tugas.pegawai_ids or current_user.id not in tugas.pegawai_ids:
            tugas.pegawai_ids.append(current_user.id)
        # Pastikan pegawai tidak menugaskan tugas ke user lain jika bukan admin
        if any(user_id != current_user.id for user_id in tugas.pegaji_ids): # Typo fixed
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Pegawai hanya dapat menugaskan tugas kepada diri sendiri."
            )

    db_tugas = crud_tugas.create_tugas(db=db, tugas=tugas, dibuat_oleh_user_id=current_user.id)
    if not db_tugas:
        raise HTTPException(status_code=400, detail="Failed to create task.")
    return db_tugas

@router.get("/{tugas_id}", response_model=TugasResponse)
async def read_task_endpoint(
    tugas_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mendapatkan detail tugas berdasarkan ID."""
    tugas = crud_tugas.get_tugas(db, tugas_id=tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")

    # Autorasi: Admin bisa melihat semua tugas. Pegawai hanya bisa melihat tugasnya sendiri.
    if current_user.role == "pegawai":
        is_assigned_to_user = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned_to_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to view this task"
            )
    return tugas

@router.put("/{tugas_id}", response_model=TugasResponse)
async def update_task_endpoint(
    tugas_id: int, tugas_update: TugasUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Memperbarui tugas."""
    db_tugas = crud_tugas.get_tugas(db, tugas_id)
    if not db_tugas:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validasi bahwa semua pegawai_ids yang diberikan benar-benar ada (jika diupdate)
    if tugas_update.pegawai_ids is not None:
        for pegawai_id in tugas_update.pegawai_ids:
            if not crud_user.get_user(db, pegawai_id):
                raise HTTPException(status_code=400, detail=f"Pegawai dengan ID {pegawai_id} tidak ditemukan.")

    # Autorasi update: Admin bisa update semua. Pegawai hanya bisa update tugasnya sendiri.
    if current_user.role == "pegawai":
        is_assigned_to_user = any(assignment.pegawai_id == current_user.id for assignment in db_tugas.penugasan_tugas)
        if not is_assigned_to_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this task"
            )
        # Jika pegawai mengupdate, pastikan tidak mengubah penugasan ke user lain (kecuali admin)
        if tugas_update.pegawai_ids is not None and any(user_id != current_user.id for user_id in tugas_update.pegawai_ids):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Pegawai tidak dapat menugaskan ulang tugas ke orang lain."
            )

    updated_tugas = crud_tugas.update_tugas(db, tugas_id=tugas_id, tugas_update=tugas_update, updated_by_user_id=current_user.id)
    if not updated_tugas:
        raise HTTPException(status_code=400, detail="Failed to update task.")
    return updated_tugas

@router.delete("/{tugas_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task_endpoint(
    tugas_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa menghapus
):
    """Melakukan soft delete pada tugas (hanya untuk Admin)."""
    if not crud_tugas.soft_delete_tugas(db, tugas_id):
        raise HTTPException(status_code=404, detail="Task not found")
    return