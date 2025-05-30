# backend/app/schemas/komentar_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse 

class KomentarTugasBase(BaseModel):
    tugas_id: int
    komentar: Optional[str] = None

class KomentarTugasCreate(KomentarTugasBase):
    pass

class KomentarTugasResponse(KomentarTugasBase):
    id: int
    user_id: int
    created_at: datetime
    user: Optional[UserResponse] = None 

    class Config:
        orm_mode = True