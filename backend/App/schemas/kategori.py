# backend/app/schemas/kategori.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class KategoriBase(BaseModel):
    nama: str
    deskripsi: Optional[str] = None

class KategoriCreate(KategoriBase):
    pass

class KategoriUpdate(KategoriBase):
    is_deleted: Optional[bool] = None

class KategoriResponse(KategoriBase):
    id: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None
    is_deleted: bool

    class Config:
        orm_mode = True