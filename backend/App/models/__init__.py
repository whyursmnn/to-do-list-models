# backend/app/models/__init__.py
# Import semua model agar terdaftar di Base.metadata
from .user import User
from .kategori import Kategori
from .tugas import Tugas
from .penugasan_tugas import PenugasanTugas
from .komentar_tugas import KomentarTugas
from .lampiran_tugas import LampiranTugas
from .riwayat_status_tugas import RiwayatStatusTugas
from .log_autentikasi import LogAutentikasi