# backend/app/crud/user.py
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id, User.is_deleted == False).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username, User.is_deleted == False).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email, User.is_deleted == False).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).filter(User.is_deleted == False).offset(skip).limit(limit).all()

def create_user(db: Session, user: UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        name=user.name,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def update_user(db: Session, user_id: int, user_update: UserUpdate):
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

def soft_delete_user(db: Session, user_id: int):
    db_user = get_user(db, user_id)
    if not db_user:
        return False
    db_user.is_deleted = True
    db.commit()
    db.refresh(db_user)
    return True
