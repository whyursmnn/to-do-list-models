// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-2xl mt-4">Halaman Tidak Ditemukan</p>
      <p className="text-lg mt-2">Maaf, halaman yang Anda cari tidak ada.</p>
      <Link to="/" className="btn btn-primary mt-8">Kembali ke Dashboard</Link>
    </div>
  );
};

export default NotFoundPage;