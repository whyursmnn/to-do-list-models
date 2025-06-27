// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Link } from 'react-router-dom';
import { getTasks } from '../services/taskService'; // Import untuk statistik tugas

const DashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    myTasks: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Handle opening the sidebar
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };
  
  // Handle closing the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Effect to handle click outside sidebar on mobile
  useEffect(() => {
    function handleClickOutside(event) {
      // Only do this on mobile/tablet view
      if (window.innerWidth < 1024) {
        const sidebar = document.querySelector('aside');
        const hamburgerButton = document.querySelector('button[aria-label="Open menu"]');
        
        // Close sidebar if click is outside sidebar and not on the hamburger button
        if (
          sidebar && 
          !sidebar.contains(event.target) && 
          hamburgerButton && 
          !hamburgerButton.contains(event.target)
        ) {
          setIsSidebarOpen(false);
        }
      }
    }
    
    // Add event listener when sidebar is open
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Use useCallback to memoize the fetchDashboardStats function
  const fetchDashboardStats = useCallback(async () => {
    setLoadingStats(true);
    setErrorStats(null);
    try {
      const allTasks = await getTasks(); // Mengambil semua tugas (API sudah memfilter berdasarkan role)

      const total = allTasks.length;
      const completed = allTasks.filter(task => task.status === 'done').length;
      const pending = allTasks.filter(task => task.status === 'to_do' || task.status === 'in_progress').length;
      const myTasks = user?.role === 'pegawai' 
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
  }, [user]);  // Add user as a dependency

  useEffect(() => {
    if (!authLoading && user) { // Hanya fetch statistik jika user sudah terautentikasi dan loading selesai
      fetchDashboardStats();
    }
  }, [authLoading, user, fetchDashboardStats]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  // Add an overlay when the sidebar is open on mobile
  const Overlay = () => (
    <div 
      className={`${isSidebarOpen ? 'block' : 'hidden'} lg:hidden fixed inset-0 z-20 bg-black bg-opacity-50`}
      onClick={closeSidebar}
    />
  );

  return (
    <div className="flex h-screen w-screen bg-base-200 overflow-hidden">
      {/* Overlay for mobile */}
      <Overlay />
      
      {/* Sidebar - responsive */}
      <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      
      <div className="flex-1 flex flex-col">
        <Navbar openSidebar={openSidebar} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-4 md:mb-6 lg:mb-8">Selamat Datang, {user?.name || user?.username}!</h1>

          {/* Stats cards - responsive grid on small screens, horizontal stats on larger screens */}
          <div className="stats stats-vertical sm:stats-horizontal shadow-lg bg-base-100 mb-4 md:mb-6 lg:mb-8 w-full overflow-x-auto">
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
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 md:w-8 md:h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="stat-title text-xs md:text-sm">Total Tugas</div>
                  <div className="stat-value text-lg md:text-2xl lg:text-3xl">{stats.totalTasks}</div>
                  <div className="stat-desc text-xs md:text-sm">Semua tugas di sistem</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 md:w-8 md:h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div className="stat-title text-xs md:text-sm">Tugas Selesai</div>
                  <div className="stat-value text-lg md:text-2xl lg:text-3xl">{stats.completedTasks}</div>
                  <div className="stat-desc text-xs md:text-sm">Tugas yang sudah Done</div>
                </div>

                <div className="stat">
                  <div className="stat-figure text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 md:w-8 md:h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                  </div>
                  <div className="stat-title text-xs md:text-sm">Tugas Menunggu</div>
                  <div className="stat-value text-lg md:text-2xl lg:text-3xl">{stats.pendingTasks}</div>
                  <div className="stat-desc text-xs md:text-sm">To Do / In Progress</div>
                </div>

                 <div className="stat">
                  <div className="stat-figure text-info">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 md:w-8 md:h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  </div>
                  <div className="stat-title text-xs md:text-sm">Tugas Saya</div>
                  <div className="stat-value text-lg md:text-2xl lg:text-3xl">{stats.myTasks}</div>
                  <div className="stat-desc text-xs md:text-sm">Tugas yang relevan untuk Anda</div>
                </div>
              </>
            )}
          </div>

          {/* Action cards - responsive grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6 lg:mb-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <h2 className="card-title text-base-content text-lg md:text-xl">Kelola Tugas</h2>
                <p className="text-sm md:text-base">Lihat dan kelola semua tugas, buat tugas baru, dan perbarui status.</p>
                <div className="card-actions justify-end mt-2">
                  <Link 
                    to="/tasks" 
                    className="flex items-center px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-blue-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span className="text-white font-semibold">Buka Tugas</span>
                  </Link>
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-4 md:p-6">
                  <h2 className="card-title text-base-content text-lg md:text-xl">Manajemen Pengguna</h2>
                  <p className="text-sm md:text-base">Kelola akun pengguna, peran, dan detail lainnya di sistem.</p>
                  <div className="card-actions justify-end mt-2">
                    <Link 
                      to="/users" 
                      className="flex items-center px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-lg shadow-md hover:from-purple-700 hover:to-purple-800 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <span className="text-white font-semibold">Kelola Pengguna</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <h2 className="card-title text-base-content text-lg md:text-xl">Manajemen Kategori</h2>
                <p className="text-sm md:text-base">Atur dan kelola kategori untuk tugas-tugas Anda agar lebih terorganisir.</p>
                <div className="card-actions justify-end mt-2">
                  <Link 
                    to="/categories" 
                    className="flex items-center px-3 md:px-5 py-2 md:py-2.5 text-sm md:text-base bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-medium rounded-lg shadow-md hover:from-cyan-600 hover:to-cyan-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-opacity-50 transition duration-200 ease-in-out"
                  >
                    <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    <span className="text-white font-semibold">Kelola Kategori</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;