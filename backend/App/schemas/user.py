
# backend/app/schemas/user.py
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    role: Optional[str] = "pegawai" # 'admin' or 'pegawai'

class UserCreate(UserBase):
    password: str
    email: EmailStr # Tambahkan email untuk registrasi

class UserUpdate(UserBase):
    password: Optional[str] = None
    email: Optional[EmailStr] = None
    is_deleted: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    email: EmailStr
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        orm_mode = True