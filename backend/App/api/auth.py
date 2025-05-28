# backend/app/api/auth.py
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserCreate, UserResponse
from app.crud import user as crud_user
from app.crud import log_autentikasi as crud_log
from app.core.security import verify_password, create_access_token
from app.core.dependencies import get_current_admin_user
from app.models.user import User # Untuk type hinting user

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user: UserCreate, db: Session = Depends(get_db),
                        current_user: User = Depends(get_current_admin_user)): # Hanya admin yang bisa mendaftar
    db_user = crud_user.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    db_user = crud_user.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_user.create_user(db=db, user=user)

@router.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud_user.get_user_by_username(db, username=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Catat log login
    crud_log.create_log_autentikasi(db, user_id=user.id)

    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "user_role": user.role, "user_id": user.id}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_user(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Catat log logout
    crud_log.update_logout_time(db, user_id=current_user.id)
    return