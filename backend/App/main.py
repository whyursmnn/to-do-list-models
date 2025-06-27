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
    "http://localhost:3000", 
   
    "http://127.0.0.1:8000",
    "http://127.0.0.1:5173", 
    "http://localhost:5173", 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


UPLOAD_DIRECTORY = "uploads"
os.makedirs(UPLOAD_DIRECTORY, exist_ok=True) 
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIRECTORY), name="uploads")



app.include_router(api_router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Welcome to the To-Do List Company API!"}