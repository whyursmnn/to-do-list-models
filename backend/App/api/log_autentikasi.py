# backend/app/api/log_autentikasi.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.log_autentikasi import LogAutentikasiResponse
from app.crud import log_autentikasi as crud_log
from app.core.dependencies import get_current_admin_user
from app.models.user import User

router = APIRouter()

@router.get("/users/{user_id}/auth-logs", response_model=List[LogAutentikasiResponse])
async def read_auth_logs_for_user(
    user_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user) # Hanya admin yang bisa melihat log autentikasi
):
    """Mendapatkan log autentikasi untuk pengguna tertentu (hanya untuk Admin)."""
    logs = crud_log.get_logs_by_user_id(db, user_id, skip=skip, limit=limit)
    return logs