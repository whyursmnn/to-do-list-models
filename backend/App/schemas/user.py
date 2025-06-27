# backend/app/schemas/user.py

from pydantic import BaseModel
from typing import Optional, List # List mungkin tidak terpakai jika email dihapus, tapi biarkan saja
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    role: Optional[str] = "pegawai" 

class UserCreate(UserBase):
    password: str

# =====================================================================
# DIPERBAIKI: UserUpdate TIDAK lagi mewarisi dari UserBase.
# Semua field yang MUNGKIN di-update harus bersifat Optional di sini.
# =====================================================================
class UserUpdate(BaseModel): # <--- PENTING: Mewarisi dari BaseModel, BUKAN UserBase
    username: Optional[str] = None # Sekarang opsional untuk update
    password: Optional[str] = None
    name: Optional[str] = None     # Sekarang opsional untuk update
    role: Optional[str] = None     # Sekarang opsional untuk update
    is_deleted: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        # Pastikan ini 'from_attributes = True' untuk Pydantic v2
        # Jika masih 'orm_mode = True', itu hanya warning tapi baiknya disesuaikan
        from_attributes = True