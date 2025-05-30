# backend/app/schemas/lampiran_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse 

class LampiranTugasBase(BaseModel):
    tugas_id: int
    file_url: Optional[str] = None 
    deskripsi: Optional[str] = None

class LampiranTugasCreate(LampiranTugasBase):
    pass

class LampiranTugasResponse(LampiranTugasBase):
    id: int
    uploaded_by: int
    uploaded_at: datetime
    uploaded_by_user: Optional[UserResponse] = None 
    class Config:
        orm_mode = True