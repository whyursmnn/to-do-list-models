# backend/app/api/lampiran_tugas.py
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os # Untuk menyimpan file

from app.core.database import get_db
from app.schemas.lampiran_tugas import LampiranTugasCreate, LampiranTugasResponse
from app.crud import lampiran_tugas as crud_lampiran
from app.crud import tugas as crud_tugas 
from app.core.dependencies import get_current_user, get_current_admin_user
from app.models.user import User

router = APIRouter()


UPLOAD_DIRECTORY = "uploads"

os.makedirs(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", UPLOAD_DIRECTORY), exist_ok=True)
ACTUAL_UPLOAD_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", UPLOAD_DIRECTORY)

@router.get("/task/{tugas_id}", response_model=List[LampiranTugasResponse])
async def read_attachments_for_task(
    tugas_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mendapatkan semua lampiran untuk tugas tertentu."""
    
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to view attachments for this task")

    attachments = crud_lampiran.get_lampiran_by_tugas_id(db, tugas_id, skip=skip, limit=limit)
    return attachments

@router.post("/", response_model=LampiranTugasResponse, status_code=status.HTTP_201_CREATED)
async def upload_attachment_endpoint(
    tugas_id: int = Form(...),   
    file: UploadFile = File(...),
    deskripsi: Optional[str] = Form(None), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengunggah lampiran baru untuk tugas."""
    
    tugas = crud_tugas.get_tugas(db, tugas_id)
    if not tugas:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role == "pegawai":
        is_assigned = any(assignment.pegawai_id == current_user.id for assignment in tugas.penugasan_tugas)
        if not is_assigned:
            raise HTTPException(status_code=403, detail="Not authorized to upload attachments for this task")

    
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{os.urandom(16).hex()}{file_extension}"
    file_location = os.path.join(ACTUAL_UPLOAD_PATH, unique_filename)

    try:
        with open(file_location, "wb+") as file_object:
            file_object.write(await file.read())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {e}")

    
    lampiran_create = LampiranTugasCreate(
        tugas_id=tugas_id,
        file_url=f"/uploads/{unique_filename}",
        deskripsi=deskripsi
    )
    return crud_lampiran.create_lampiran_tugas(db=db, lampiran=lampiran_create, uploaded_by_user_id=current_user.id)

@router.put("/{lampiran_id}", response_model=LampiranTugasResponse) 
async def get_attachment(file_name: str):
    """Mengambil file lampiran berdasarkan nama file."""
    file_path = os.path.join(ACTUAL_UPLOAD_PATH, file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(path=file_path, filename=file_name)


@router.delete("/{lampiran_id}", status_code=status.HTTP_204_NO_CONTENT) 
async def delete_attachment_endpoint(
    lampiran_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) 
):
    """Menghapus lampiran tugas (hanya untuk Admin)."""
    db_lampiran = crud_lampiran.get_lampiran_tugas(db, lampiran_id)
    if not db_lampiran:
        raise HTTPException(status_code=404, detail="Attachment not found")
    
    
    if db_lampiran.file_url:
        
        file_name = db_lampiran.file_url.split('/')[-1]
        file_path_to_delete = os.path.join(ACTUAL_UPLOAD_PATH, file_name)
        if os.path.exists(file_path_to_delete):
            os.remove(file_path_to_delete)

    if not crud_lampiran.delete_lampiran_tugas(db, lampiran_id):
        raise HTTPException(status_code=404, detail="Attachment not found in DB")
    return