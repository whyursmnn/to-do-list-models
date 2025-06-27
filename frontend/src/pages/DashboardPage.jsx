// frontend/src/pages/DashboardPage.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { Link } from 'react-router-dom'; // Tambahkan Link

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar /> {/* Komponen sidebar */}
      <div className="flex-1 flex flex-col">
        <Navbar /> {/* Komponen navbar */}
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-6">Selamat Datang, {user?.name || user?.username}!</h1>
          <p className="text-lg text-base-content mb-8">
            Anda login sebagai {user?.role}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Tugas Saya</h2>
                <p>Lihat dan kelola tugas yang ditugaskan kepada Anda.</p>
                <div className="card-actions justify-end">
                  <Link to="/tasks" className="btn btn-primary">Lihat Tugas</Link>
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Manajemen Pengguna</h2>
                  <p>Kelola akun pengguna, peran, dan detail lainnya.</p>
                  <div className="card-actions justify-end">
                    <Link to="/users" className="btn btn-secondary">Kelola Pengguna</Link>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Kategori Tugas</h2>
                <p>Atur dan kelola kategori untuk tugas-tugas Anda.</p>
                <div className="card-actions justify-end">
                  <Link to="/categories" className="btn btn-info">Kelola Kategori</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button onClick={logout} className="btn btn-warning">Logout</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;