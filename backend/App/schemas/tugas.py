# backend/app/schemas/tugas.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# Import skema respons untuk nested data
from app.schemas.user import UserResponse
from app.schemas.kategori import KategoriResponse

# Enum untuk Prioritas dan Status
class PrioritasEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class StatusEnum(str, Enum):
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
    # Untuk penugasan, kita akan menerima list ID pegawai
    pegawai_ids: Optional[List[int]] = []

class TugasCreate(TugasBase):
    pass

class TugasUpdate(TugasBase):
    is_deleted: Optional[bool] = None

class TugasResponse(TugasBase):
    id: int
    dibuat_oleh: int
    updated_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    is_deleted: bool
    kategori: Optional[KategoriResponse] = None # Nested kategori
    # Untuk menampilkan pegawai yang ditugaskan
    penugasan_tugas: List[UserResponse] = [] # Akan diisi dengan UserResponse dari PenugasanTugas

    class Config:
        orm_mode = True

# Skema untuk PenugasanTugas (jika perlu endpoint terpisah)
class PenugasanTugasBase(BaseModel):
    tugas_id: int
    pegawai_id: int

class PenugasanTugasResponse(PenugasanTugasBase):
    id: int

    class Config:
        orm_mode = True