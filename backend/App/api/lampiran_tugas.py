# backend/app/api/lampiran_tugas.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os # Untuk menyimpan file

from app.core.database import get_db
from app.schemas.lampiran_tugas import LampiranTugasCreate, LampiranTugasResponse
from app.crud import lampiran_tugas as crud_lampiran
from app.crud import tugas as crud_tugas # Untuk validasi tugas_id
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# Direktori untuk menyimpan file lampiran
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True)

@router.get("/task/{tugas_id}/attachments", response_model=List[LampiranTugasResponse])
async def read_attachments_for_task(
    tugas_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Otorisasi: Pastikan user memiliki akses ke tugas ini (admin atau ditugaskan)
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to view attachments for this task")

    attachments = crud_lampiran.get_lampiran_by_tugas_id(db, tugas_id, skip=skip, limit=limit)
    return attachments

@router.post("/attachments", response_model=LampiranTugasResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment_endpoint(
    tugas_id: int,
    deskripsi: Optional[str] = None,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Otorisasi: Pastikan user memiliki akses ke tugas ini (admin atau ditugaskan)
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to upload attachments for this task")

    # Simpan file ke direktori lokal
    file_location = os.path.join(UPLOAD_DIRECTORY, file.filename)
    with open(file_location, "wb+") as file_object:
        file_object.write(file.file.read())

    lampiran_create = LampiranTugasCreate(
        tugas_id=tugas_id,
        file_url=f"/uploads/{file.filename}", # URL untuk akses file
        deskripsi=deskripsi
    )
    return crud_lampiran.create_lampiran_tugas(db=db, lampiran=lampiran_create, uploaded_by_user_id=current_user.id)

@router.delete("/attachments/{lampiran_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_attachment_endpoint(
    lampiran_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa menghapus lampiran
):
    # Implementasi penghapusan file fisik juga jika diperlukan
    db_lampiran = crud_lampiran.get_lampiran_tugas(db, lampiran_id)
    if db_lampiran and db_lampiran.file_url:
        file_path = os.path.join(os.getcwd(), db_lampiran.file_url.lstrip('/'))
        if os.path.exists(file_path):
            os.remove(file_path)

    if not crud_lampiran.delete_lampiran_tugas(db, lampiran_id):
        raise HTTPException(status_code=404, detail="Attachment not found")
    return