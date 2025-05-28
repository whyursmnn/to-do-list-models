# backend/app/schemas/komentar_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user

class KomentarTugasBase(BaseModel):
    tugas_id: int
    komentar: Optional[str] = None

class KomentarTugasCreate(KomentarTugasBase):
    pass

class KomentarTugasResponse(KomentarTugasBase):
    id: int
    user_id: int
    created_at: datetime
    user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True

# backend/app/schemas/lampiran_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user

class LampiranTugasBase(BaseModel):
    tugas_id: int
    file_url: Optional[str] = None
    deskripsi: Optional[str] = None

class LampiranTugasCreate(LampiranTugasBase):
    pass

class LampiranTugasResponse(LampiranTugasBase):
    id: int
    uploaded_by: int
    uploaded_at: datetime
    uploaded_by_user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True

# backend/app/schemas/riwayat_status_tugas.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user
from app.schemas.tugas import StatusEnum # Menggunakan enum status

class RiwayatStatusTugasBase(BaseModel):
    tugas_id: int
    status_lama: Optional[StatusEnum] = None
    status_baru: StatusEnum # Status baru harus selalu ada

class RiwayatStatusTugasCreate(RiwayatStatusTugasBase):
    pass

class RiwayatStatusTugasResponse(RiwayatStatusTugasBase):
    id: int
    diubah_oleh: int
    waktu_ubah: datetime
    diubah_oleh_user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True

# backend/app/schemas/log_autentikasi.py
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.schemas.user import UserResponse # Untuk nested user

class LogAutentikasiBase(BaseModel):
    user_id: int
    login_time: datetime
    logout_time: Optional[datetime] = None

class LogAutentikasiCreate(LogAutentikasiBase):
    pass

class LogAutentikasiResponse(LogAutentikasiBase):
    id: int
    user: Optional[UserResponse] = None # Nested user

    class Config:
        orm_mode = True