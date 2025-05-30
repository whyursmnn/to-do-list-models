# backend/app/api/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user import UserResponse, UserCreate, UserUpdate
from app.crud import user as crud_user
from app.core.dependencies import get_current_admin_user
from app.models.user import User 

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Mendapatkan daftar semua pengguna (hanya untuk Admin)."""
    users = crud_user.get_users(db, skip=skip, limit=limit)
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user: UserCreate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Membuat pengguna baru (hanya untuk Admin)."""
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return crud_user.create_user(db=db, user=user)

@router.put("/{user_id}", response_model=UserResponse)
async def update_user_endpoint(
    user_id: int, user_update: UserUpdate, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Memperbarui informasi pengguna (hanya untuk Admin)."""
    updated_user = crud_user.update_user(db, user_id, user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: int, db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Melakukan soft delete pada pengguna (hanya untuk Admin)."""
    if not crud_user.soft_delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return