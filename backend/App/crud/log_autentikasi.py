# backend/app/crud/log_autentikasi.py
from sqlalchemy.orm import Session, joinedload
from app.models.log_autentikasi import LogAutentikasi
from app.schemas.log_autentikasi import LogAutentikasiCreate
from typing import List
from datetime import datetime

def get_log_autentikasi(db: Session, log_id: int):
    return db.query(LogAutentikasi).filter(LogAutentikasi.id == log_id).first()

def get_logs_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(LogAutentikasi)\
             .options(joinedload(LogAutentikasi.user))\
             .filter(LogAutentikasi.user_id == user_id)\
             .order_by(LogAutentikasi.login_time.desc())\
             .offset(skip).limit(limit).all()

def create_log_autentikasi(db: Session, user_id: int, login_time: datetime = None):
    if login_time is None:
        login_time = datetime.utcnow()
    db_log = LogAutentikasi(
        user_id=user_id,
        login_time=login_time
    )
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

def update_logout_time(db: Session, user_id: int):
    # Temukan log login terakhir yang belum logout
    db_log = db.query(LogAutentikasi)\
               .filter(LogAutentikasi.user_id == user_id, LogAutentikasi.logout_time == None)\
               .order_by(LogAutentikasi.login_time.desc())\
               .first()
    if db_log:
        db_log.logout_time = datetime.utcnow()
        db.commit()
        db.refresh(db_log)
        return db_log
    return None