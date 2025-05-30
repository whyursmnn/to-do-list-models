# backend/app/schemas/log_autentikasi.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse 

class LogAutentikasiBase(BaseModel):
    user_id: int
    login_time: datetime
    logout_time: Optional[datetime] = None

class LogAutentikasiCreate(LogAutentikasiBase):
    pass

class LogAutentikasiResponse(LogAutentikasiBase):
    id: int
    user: Optional[UserResponse] = None 

    class Config:
        orm_mode = True