# backend/app/schemas/lampiran_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user

class LampiranTugasBase(BaseModel):
    tugas_id: int
    file_url: Optional[str] = None # URL ke file yang diunggah
    deskripsi: Optional[str] = None

class LampiranTugasCreate(LampiranTugasBase):
    pass

class LampiranTugasResponse(LampiranTugasBase):
    id: int
    uploaded_by: int
    uploaded_at: datetime
    uploaded_by_user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True