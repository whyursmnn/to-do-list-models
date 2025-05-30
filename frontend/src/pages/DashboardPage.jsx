// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/taskService'; // Import untuk statistik tugas

const DashboardPage = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    myTasks: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);

  useEffect(() => {
    if (!authLoading && user) { // Hanya fetch statistik jika user sudah terautentikasi dan loading selesai
      fetchDashboardStats();
    }
  }, [authLoading, user]); // Jalankan ketika status autentikasi atau user berubah

  const fetchDashboardStats = async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const allTasks = await getTasks(); // Mengambil semua tugas (API sudah memfilter berdasarkan role)

      const total = allTasks.length;
      const completed = allTasks.filter(task => task.status === 'done').length;
      const pending = allTasks.filter(task => task.status === 'to_do' || task.status === 'in_progress').length;
      const myTasks = user.role === 'pegawai' 
                      ? allTasks.filter(task => 
                          task.penugasan_tugas.some(assignee => assignee.pegawai_user.id === user.id)
                        ).length
                      : total; // Admin melihat semua tugas sebagai "tugas saya" secara statistik

      setStats({
        totalTasks: total,
        completedTasks: completed,
        pendingTasks: pending,
        myTasks: myTasks,
      });
    } catch (err) {
      setErrorStats('Gagal memuat statistik dashboard.');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-8">Selamat Datang, {user?.name || user?.username}!</h1>

          <div className="stats stats-vertical lg:stats-horizontal shadow-lg bg-base-100 mb-8 w-full">
            {loadingStats ? (
              <div className="stat text-center">
                <LoadingSpinner />
                <span className="stat-title">Memuat Statistik...</span>
              </div>
            ) : errorStats ? (
              <div className="stat text-error text-center">
                <div className="stat-title">Error</div>
                <div className="stat-value text-error">!</div>
                <div className="stat-desc">{errorStats}</div>
              </div>
            ) : (
              <>
                <div className="stat">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="stat-title">Total Tugas</div>
                  <div className="stat-value">{stats.totalTasks}</div>
                  <div className="stat-desc">Semua tugas di sistem</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div className="stat-title">Tugas Selesai</div>
                  <div className="stat-value">{stats.completedTasks}</div>
                  <div className="stat-desc">Tugas yang sudah Done</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                  </div>
                  <div className="stat-title">Tugas Menunggu</div>
                  <div className="stat-value">{stats.pendingTasks}</div>
                  <div className="stat-desc">To Do / In Progress</div>
                </div>

                 <div className="stat">
                  <div className="stat-figure text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="stat-title">Tugas Saya</div>
                  <div className="stat-value">{stats.myTasks}</div>
                  <div className="stat-desc">Tugas yang relevan untuk Anda</div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-base-content">Kelola Tugas</h2>
                <p>Lihat dan kelola semua tugas, buat tugas baru, dan perbarui status.</p>
                <div className="card-actions justify-end">
                  <Link to="/tasks" className="btn btn-primary">Buka Tugas</Link>
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-base-content">Manajemen Pengguna</h2>
                  <p>Kelola akun pengguna, peran, dan detail lainnya di sistem.</p>
                  <div className="card-actions justify-end">
                    <Link to="/users" className="btn btn-secondary">Kelola Pengguna</Link>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-base-content">Manajemen Kategori</h2>
                <p>Atur dan kelola kategori untuk tugas-tugas Anda agar lebih terorganisir.</p>
                <div className="card-actions justify-end">
                  <Link to="/categories" className="btn btn-info">Kelola Kategori</Link>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button onClick={logout} className="btn btn-warning btn-lg">Logout</button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;