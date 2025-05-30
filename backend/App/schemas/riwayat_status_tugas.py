# backend/app/schemas/riwayat_status_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse 
from app.schemas.tugas import StatusEnum 

class RiwayatStatusTugasBase(BaseModel):
    tugas_id: int
    status_lama: Optional[StatusEnum] = None
    status_baru: StatusEnum 

class RiwayatStatusTugasCreate(RiwayatStatusTugasBase):
    pass

class RiwayatStatusTugasResponse(RiwayatStatusTugasBase):
    id: int
    diubah_oleh: int
    waktu_ubah: datetime
    diubah_oleh_user: Optional[UserResponse] = None 

    class Config:
        orm_mode = True