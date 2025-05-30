
# backend/app/schemas/user.py
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    username: str
    name: Optional[str] = None
    role: Optional[str] = "pegawai" 

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None
    is_deleted: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime
    is_deleted: bool

    class Config:
        orm_mode = True