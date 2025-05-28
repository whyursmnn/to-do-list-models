# backend/app/schemas/riwayat_status_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user
from app.schemas.tugas import StatusEnum # Menggunakan enum status dari tugas.py

class RiwayatStatusTugasBase(BaseModel):
    tugas_id: int
    status_lama: Optional[StatusEnum] = None
    status_baru: StatusEnum # Status baru harus selalu ada

class RiwayatStatusTugasCreate(RiwayatStatusTugasBase):
    pass

class RiwayatStatusTugasResponse(RiwayatStatusTugasBase):
    id: int
    diubah_oleh: int
    waktu_ubah: datetime
    diubah_oleh_user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True