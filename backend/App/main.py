# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Untuk melayani file statis
from app.api import api_router
from app.core.database import Base, engine
import os

app = FastAPI(
    title="To-Do List Perusahaan API",
    description="API untuk manajemen tugas perusahaan dengan peran Admin dan Pegawai.",
    version="0.1.0",
)

# Konfigurasi CORS
origins = [
    "http://localhost",
    "http://localhost:3000", # Port default untuk aplikasi React
    # Tambahkan origin frontend Anda di sini saat deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount direktori 'uploads' sebagai direktori statis
UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True) # Pastikan direktori ada
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY), name="uploads")


# Include API router utama
app.include_router(api_router, prefix="/api")

# Event handler untuk membuat tabel database saat aplikasi dimulai
@app.on_event("startup")
def on_startup():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created.")

# Route dasar
@app.get("/")
async def root():
    return {"message": "Welcome to the To-Do List Company API!"}