# backend/app/schemas/tugas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from enum import Enum as PyEnum 


from app.schemas.user import UserResponse
from app.schemas.kategori import KategoriResponse


class PrioritasEnum(str, PyEnum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, PyEnum):
    to_do = "to_do"
    in_progress = "in_progress"
    done = "done"
    archived = "archived"

class TugasBase(BaseModel):
    judul: str
    deskripsi: Optional[str] = None
    prioritas: Optional[PrioritasEnum] = PrioritasEnum.medium
    status: Optional[StatusEnum] = StatusEnum.to_do
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    kategori_id: Optional[int] = None
    
    pegawai_ids: Optional[List[int]] = []

class TugasCreate(TugasBase):
    pass

class TugasUpdate(BaseModel): 
    judul: Optional[str] = None
    deskripsi: Optional[str] = None
    prioritas: Optional[PrioritasEnum] = None
    status: Optional[StatusEnum] = None
    tanggal_mulai: Optional[date] = None
    tanggal_selesai: Optional[date] = None
    kategori_id: Optional[int] = None
    pegawai_ids: Optional[List[int]] = None
    is_deleted: Optional[bool] = None


class PenugasanTugasWithUserResponse(BaseModel):
    id: int
    tugas_id: int
    pegawai_id: int
    pegawai_user: Optional[UserResponse] = None

    class Config:
        from_attributes = True 


class TugasResponse(TugasBase):
    id: int
    dibuat_oleh: int
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    kategori: Optional[KategoriResponse] = None 
    penugasan_tugas: List[PenugasanTugasWithUserResponse] = []

    class Config:
        from_attributes = True


class PenugasanTugasBase(BaseModel):
    tugas_id: int
    pegawai_id: int

class PenugasanTugasResponse(PenugasanTugasBase):
    id: int

    class Config:
        from_attributes = True
