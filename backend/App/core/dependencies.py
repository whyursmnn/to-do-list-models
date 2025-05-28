# backend/app/core/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError

from app.core.database import get_db
from app.core.security import decode_access_token
from app.crud import user as crud_user # Import CRUD user
from app.models.user import User # Import model User

# URL tempat klien akan mengirimkan kredensial untuk mendapatkan token
# Ini akan digunakan oleh klien untuk mengetahui di mana harus POST username/password
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Dependensi untuk mendapatkan pengguna saat ini dari token JWT."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        if payload is None:
            raise credentials_exception
        user_id: int = payload.get("sub") # 'sub' adalah identitas user (ID)
        user_role: str = payload.get("role") # 'role' adalah peran user
        if user_id is None or user_role is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = crud_user.get_user(db, user_id=int(user_id)) # Pastikan user_id diubah ke int
    if user is None:
        raise credentials_exception
    return user

def get_current_admin_user(current_user: User = Depends(get_current_user)):
    """Dependensi untuk memastikan pengguna saat ini adalah Admin."""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions (Admin role required)"
        )
    return current_user