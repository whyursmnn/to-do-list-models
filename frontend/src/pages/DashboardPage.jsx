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
    <div className="flex h-screen w-screen bg-base-200">
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
                  <Link 
                    to="/tasks" 
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                  >
                    <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span className="text-white font-semibold">Buka Tugas</span>
                  </Link>
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-base-content">Manajemen Pengguna</h2>
                  <p>Kelola akun pengguna, peran, dan detail lainnya di sistem.</p>
                  <div className="card-actions justify-end mt-3">
                    <Link 
                      to="/users" 
                      className="flex items-center px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                    >
                      <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <span className="text-white font-semibold">Kelola Pengguna</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-base-content">Manajemen Kategori</h2>
                <p>Atur dan kelola kategori untuk tugas-tugas Anda agar lebih terorganisir.</p>
                <div className="card-actions justify-end mt-3">
                  <Link 
                    to="/categories" 
                    className="flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:from-cyan-600 hover:to-cyan-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                  >
                    <svg className="w-5 h-5 mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span className="text-white font-semibold">Kelola Kategori</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-10">
            <button 
              onClick={logout} 
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg shadow-md hover:from-amber-600 hover:to-orange-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 active:from-amber-700 active:to-orange-700 transform active:scale-95 transition duration-150 ease-in-out flex items-center gap-2"
            >
              <span className="font-semibold">Logout</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.5a.5.5 0 01-.5.5h-7a.5.5 0 010-1h7a.5.5 0 01.5.5zm0 4a.5.5 0 01-.5.5h-7a.5.5 0 010-1h7a.5.5 0 01.5.5z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M6.293 9.293a1 1 0 011.414 0L10 11.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;