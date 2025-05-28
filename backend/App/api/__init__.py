# backend/app/api/__init__.py
from fastapi import APIRouter
from app.api import auth, users, kategori, tasks, komentar_tugas, lampiran_tugas, riwayat_status_tugas, log_autentikasi

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(kategori.router, prefix="/kategori", tags=["kategori"]) # Perubahan nama endpoint
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(komentar_tugas.router, prefix="/comments", tags=["comments"])
api_router.include_router(lampiran_tugas.router, prefix="/attachments", tags=["attachments"])
api_router.include_router(riwayat_status_tugas.router, prefix="/status-history", tags=["status history"])
api_router.include_router(log_autentikasi.router, prefix="/auth-logs", tags=["auth logs"])