# To-Do List Perusahaan

Aplikasi web To-Do List Perusahaan yang dirancang untuk meningkatkan produktivitas dan efisiensi dalam manajemen tugas tim. Dibangun dengan FastAPI (Python) sebagai backend dan React.js dengan Tailwind CSS (DaisyUI) sebagai frontend.

## Fitur Utama

* **Autentikasi Pengguna:** Login, Logout dengan JWT.
* **Manajemen Pengguna (Admin Only):** CRUD (Create, Read, Update, Delete) pengguna.
* **Manajemen Kategori (Admin Only):** CRUD kategori tugas.
* **Manajemen Tugas:**
    * Melihat daftar tugas (Admin: semua tugas, Pegawai: tugas yang ditugaskan).
    * Membuat tugas baru (Admin: bisa menugaskan ke siapa saja; Pegawai: otomatis menugaskan ke diri sendiri).
    * Mengedit detail tugas (judul, deskripsi, prioritas, deadline, kategori).
    * Mengubah status tugas (To Do, In Progress, Done, Archived).
    * Melakukan Soft Delete tugas.
* **Detail Tugas:**
    * Melihat komentar, menambahkan, dan menghapus komentar.
    * Melihat lampiran, mengunggah, dan menghapus lampiran.
    * Melihat riwayat perubahan status tugas.
* **Fitur Penugasan Tugas (Admin Only):** Admin dapat menugaskan tugas ke satu atau lebih pegawai.

## Teknologi yang Digunakan

* **Backend:**
    * Python 3.x
    * FastAPI (Framework Web)
    * SQLAlchemy (ORM)
    * PyMySQL (Database Driver untuk MySQL)
    * Passlib (untuk hashing password)
    * Python-Jose (untuk JWT)
    * python-dotenv (untuk variabel lingkungan)
    * Uvicorn (ASGI Server)
    * Alembic (untuk migrasi database)
* **Database:**
    * MySQL
* **Frontend:**
    * React.js (Library JavaScript)
    * Vite (Build Tool)
    * Tailwind CSS (CSS Framework)
    * DaisyUI (Komponen UI untuk Tailwind CSS)
    * Axios (HTTP Client)
    * React Router DOM (untuk Routing)

## Persyaratan Sistem

Pastikan Anda memiliki hal-hal berikut terinstal di sistem Anda:

* **Node.js** (versi 16.x atau lebih tinggi, disarankan LTS) dan **npm** (biasanya terinstal bersama Node.js).
* **Python 3.x** (versi 3.9 atau lebih tinggi, disarankan 3.10+).
* **MySQL Server** (versi 5.7 atau 8.0).
* **Git** (untuk cloning repository).
* (Opsional) **HeidiSQL** atau MySQL Workbench untuk manajemen database GUI.

## Panduan Instalasi dan Setup Proyek
