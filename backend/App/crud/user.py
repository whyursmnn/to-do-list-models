# backend/app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
from typing import List, Optional

def get_user(db: Session, user_id: int) -> Optional[User]:
    """Mendapatkan pengguna berdasarkan ID."""
    return db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

def get_user_by_username(db: Session, username: str) -> Optional[User]:
    """Mendapatkan pengguna berdasarkan username."""
    return db.query(User).filter(User.username == username, User.is_deleted == False).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
    """Mendapatkan daftar semua pengguna yang tidak dihapus."""
    return db.query(User).filter(User.is_deleted == False).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate) -> User:
    """Membuat pengguna baru."""
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        hashed_password=hashed_password,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate) -> Optional[User]:
    """Memperbarui informasi pengguna."""
    db_user = get_user(db, user_id)
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data and update_data["password"]:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    for key, value in update_data.items():
        setattr(db_user, key, value)
    
    db.commit()
    db.refresh(db_user)
    return db_user

def soft_delete_user(db: Session, user_id: int) -> bool:
    """Melakukan soft delete pada pengguna (mengatur is_deleted menjadi True)."""
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db_user.is_deleted = True
    db.commit()
    db.refresh(db_user)
    return True