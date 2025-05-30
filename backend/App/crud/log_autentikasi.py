# backend/app/crud/log_autentikasi.py
from sqlalchemy.orm import Session, joinedload
from app.models.log_autentikasi import LogAutentikasi
from typing import List, Optional
from datetime import datetime

def get_log_autentikasi(db: Session, log_id: int) -> Optional[LogAutentikasi]:
    """Mendapatkan log autentikasi berdasarkan ID."""
    return db.query(LogAutentikasi).filter(LogAutentikasi.id == log_id).first()

def get_logs_by_user_id(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[LogAutentikasi]:
    """Mendapatkan semua log autentikasi untuk pengguna tertentu."""
    return db.query(LogAutentikasi)\
             .options(joinedload(LogAutentikasi.user))\
             .filter(LogAutentikasi.user_id == user_id)\
             .order_by(LogAutentikasi.login_time.desc())\
             .offset(skip).limit(limit).all()

def create_log_autentikasi(db: Session, user_id: int, login_time: datetime = None) -> LogAutentikasi:
    """Membuat entri log autentikasi baru (login)."""
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

def update_logout_time(db: Session, user_id: int) -> Optional[LogAutentikasi]:
    """Memperbarui log autentikasi terakhir pengguna dengan waktu logout."""
    
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