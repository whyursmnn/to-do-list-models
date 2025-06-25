# backend/app/main.py

import os
import sys


current_dir = os.path.dirname(os.path.abspath(__file__))


parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, parent_dir)


sys.path.insert(0, current_dir)


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import api_router 
from app.core.database import Base, engine



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
    "https://nama-unik-frontend.netlify.app", 
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