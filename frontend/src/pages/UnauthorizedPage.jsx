// frontend/src/pages/UnauthorizedPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 text-base-content">
      <h1 className="text-6xl font-bold text-error">403</h1>
      <p className="text-2xl mt-4">Akses Ditolak</p>
      <p className="text-lg mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      <Link to="/" className="btn btn-primary mt-8">Kembali ke Dashboard</Link>
      <Link to="/login" className="btn btn-ghost mt-4">Login dengan akun lain</Link>
    </div>
  );
};

export default UnauthorizedPage;