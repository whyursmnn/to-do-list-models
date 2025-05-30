# backend/app/models/_init_.py
from .user import User
from .kategori import Kategori
from .tugas import Tugas
from .penugasan_tugas import PenugasanTugas
from .komentar_tugas import KomentarTugas
from .lampiran_tugas import LampiranTugas
from .riwayat_status_tugas import RiwayatStatusTugas
from .log_autentikasi import LogAutentikasi

_all_= [
    "User", "Kategori", "Tugas", "PenugasanTugas",
    "KomentarTugas", "LampiranTugas", "RiwayatStatusTugas", "LogAutentikasi"
]