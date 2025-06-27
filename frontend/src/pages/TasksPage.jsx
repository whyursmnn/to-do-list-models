// frontend/src/pages/TasksPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getTasks, createTask, updateTask, deleteTask, getUsers as getAllUsersForTaskCreation } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, isAdmin, isLoading: authLoading } = useAuth();
  
  // Form state untuk tambah tugas
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    pegawai_ids: []
  });
  
  // Handle opening the sidebar
  const openSidebar = () => {
    setIsSidebarOpen(true);
  };
  
  // Handle closing the sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksData] = await Promise.all([
        getTasks()
      ]);

      let usersData = [];
      if (user && user.role === 'admin') {
        try {
          usersData = await getAllUsersForTaskCreation();
        } catch (usersFetchError) {
          console.error("Error fetching all users for assignment (might be non-admin access):", usersFetchError);
        }
      }

      const formattedTasks = tasksData.map(task => ({
        ...task,
        due_date: task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A',
        assigned_to_names: task.penugasan_tugas && task.penugasan_tugas.length > 0
                          ? task.penugasan_tugas.map(pa => pa.pegawai_user ? pa.pegawai_user.name || pa.pegawai_user.username : 'Unknown').join(', ')
                          : 'Tidak ditugaskan',
        category_name: task.kategori ? task.kategori.nama : 'Tidak Berkategori',
        dibuat_oleh_user: task.dibuat_oleh_user || null,
        updated_by_user: task.updated_by_user || null
      }));
      setTasks(formattedTasks);
      setAllUsers(usersData);
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memuat data awal (tugas/pengguna). Silakan coba lagi.');
      console.error('Fetch initial data error:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, fetchInitialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => {
      const updatedIds = prev.pegawai_ids.includes(userId)
        ? prev.pegawai_ids.filter(id => id !== userId)
        : [...prev.pegawai_ids, userId];
      
      return { ...prev, pegawai_ids: updatedIds };
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('Anda harus login untuk membuat tugas.');
      return;
    }

    if (!formData.judul.trim()) {
      setError('Judul tugas tidak boleh kosong.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const taskPayload = {
        judul: formData.judul,
        deskripsi: formData.deskripsi,
        pegawai_ids: user.role === 'admin' && formData.pegawai_ids.length > 0 
                    ? formData.pegawai_ids 
                    : [user.id]
      };
      
      await createTask(taskPayload);
      fetchInitialData(); // Refresh daftar tugas dan user
      closeAddTaskModal(); // Tutup modal setelah berhasil
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal membuat tugas. Silakan coba lagi.');
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddTaskModal = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      pegawai_ids: user.role === 'pegawai' ? [user.id] : []
    });
    setIsAddTaskModalOpen(true);
  };

  const closeAddTaskModal = () => {
    setIsAddTaskModalOpen(false);
    setFormData({
      judul: '',
      deskripsi: '',
      pegawai_ids: []
    });
    setError(null);
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    if (!user) { // Pengecekan user di awal handler
      setError('Anda harus login untuk mengubah status.');
      console.error('Update status failed: User not authenticated.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateTask(taskId, { status: newStatus });
      fetchInitialData();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(prev => ({
          ...prev,
          status: newStatus
        }));
      }
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memperbarui status tugas.');
      console.error('Update status error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!user) { // Pengecekan user di awal handler
      setError('Anda harus login untuk menghapus tugas.');
      console.error('Delete task failed: User not authenticated.');
      return;
    }
    if (!window.confirm('Apakah Anda yakin ingin menghapus tugas ini? (Soft Delete)')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteTask(taskId);
      fetchInitialData();
      if (showTaskDetailModal && selectedTask.id === taskId) {
        setShowTaskDetailModal(false);
        setSelectedTask(null);
      }
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menghapus tugas. Anda mungkin tidak memiliki izin.');
      console.error('Delete task error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openDetailModal = (task) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowTaskDetailModal(false);
    setSelectedTask(null);
    fetchInitialData();
  };

  const handleTaskUpdatedInModal = (updatedTask) => {
    const formattedTask = {
      ...updatedTask,
      due_date: updatedTask.due_date ? new Date(updatedTask.due_date).toLocaleDateString() : 'N/A',
      assigned_to_names: updatedTask.penugasan_tugas && updatedTask.penugasan_tugas.length > 0
                         ? updatedTask.penugasan_tugas.map(pa => pa.pegawai_user ? pa.pegawai_user.name || pa.pegawai_user.username : 'Unknown').join(', ')
                         : 'Tidak ditugaskan',
      category_name: updatedTask.kategori ? updatedTask.kategori.nama : 'Tidak Berkategori',
      dibuat_oleh_user: updatedTask.dibuat_oleh_user || null,
      updated_by_user: updatedTask.updated_by_user || null
    };

    setTasks(prevTasks => prevTasks.map(t =>
      t.id === formattedTask.id ? formattedTask : t
    ));
    setSelectedTask(formattedTask);
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

  if (loading || authLoading) {
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
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-4 md:mb-6">Manajemen Tugas</h1>

          {error && (
            <div role="alert" className="alert alert-error mb-4 text-sm md:text-base">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Tombol Tambah Tugas Baru - responsive */}
          <div className="mb-4 md:mb-6">
            <button onClick={openAddTaskModal} className="btn btn-primary text-xs md:text-sm">
              <svg className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Tambah Tugas Baru
            </button>
          </div>

          {/* Daftar Tugas - responsive heading */}
          <div className="mb-6 md:mb-8 lg:mb-12">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 md:mb-6 dark:text-gray-100 flex items-center">
              <svg className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mr-2 md:mr-3 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              Daftar Tugas Anda
            </h2>
            
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 md:p-8 lg:p-10 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <svg className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-300 dark:text-gray-600 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                </svg>
                <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium text-center">Tidak ada tugas ditemukan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                {tasks.map(task => (
                  <div key={task.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="p-4 md:p-5 lg:p-6">
                      {/* Task Header */}
                      <div className="flex justify-between items-start mb-2 md:mb-3">
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base md:text-lg line-clamp-2">{task.judul}</h3>
                        <span className={`ml-2 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-xs font-medium flex items-center whitespace-nowrap
                          ${task.status === 'done' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 
                            task.status === 'archived' ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}
                        >
                          <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full mr-1 md:mr-1.5
                            ${task.status === 'done' ? 'bg-green-500' : 
                              task.status === 'in_progress' ? 'bg-blue-500' : 
                              task.status === 'archived' ? 'bg-gray-500' : 'bg-purple-500'}`}
                          />
                          {task.status === 'to_do' ? 'To Do' : 
                            task.status === 'in_progress' ? 'In Progress' : 
                            task.status === 'done' ? 'Done' : 'Archived'}
                        </span>
                      </div>
                      
                      {/* Task Description */}
                      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2 md:line-clamp-3">{task.deskripsi}</p>
                      
                      {/* Task Metadata */}
                      <div className="space-y-1 md:space-y-2 mb-3 md:mb-4">
                        {/* Category */}
                        <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                          </svg>
                          <span>{task.category_name}</span>
                        </div>
                        
                        {/* Deadline */}
                        <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <span>{task.due_date}</span>
                        </div>
                        
                        {/* Assigned To */}
                        <div className="flex items-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                          <span className="truncate">{task.assigned_to_names}</span>
                        </div>
                        
                        {/* Priority Badge */}
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 rounded-full text-xs font-medium
                            ${task.prioritas === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                              task.prioritas === 'medium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 
                              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                          >
                            <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                                task.prioritas === 'high' ? "M13 10V3L4 14h7v7l9-11h-7z" : // Lightning bolt for high
                                task.prioritas === 'medium' ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : // Warning for medium
                                "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" // Shield for low
                              }></path>
                            </svg>
                            <span className="text-xs md:text-xs">Prioritas {task.prioritas === 'high' ? 'Tinggi' : task.prioritas === 'medium' ? 'Sedang' : 'Rendah'}</span>
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons - FIXED DROPDOWN SECTION - responsive */}
                      <div className="flex flex-wrap gap-2 mt-4 md:mt-6">
                        {/* Fixed dropdown menu for status */}
                        <div className="dropdown dropdown-top">
                          <button className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-800">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                            </svg>
                            <span>Status</span>
                          </button>
                          <ul className="dropdown-content z-[1] menu p-2 shadow-lg bg-white dark:bg-gray-800 rounded-lg w-52 border border-gray-200 dark:border-gray-700 mb-1">
                            <li className="mb-1">
                              <button onClick={() => handleUpdateStatus(task.id, 'to_do')} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-2.5"></span>
                                To Do
                              </button>
                            </li>
                            <li className="mb-0.5 md:mb-1">
                              <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-2.5"></span>
                                In Progress
                              </button>
                            </li>
                            <li className="mb-1">
                              <button onClick={() => handleUpdateStatus(task.id, 'done')} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2.5"></span>
                                Done
                              </button>
                            </li>
                            <li>
                              <button onClick={() => handleUpdateStatus(task.id, 'archived')} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
                                <span className="w-2.5 h-2.5 rounded-full bg-gray-500 mr-2.5"></span>
                                Archived
                              </button>
                            </li>
                          </ul>
                        </div>

                        {/* Detail Button */}
                        <button 
                          onClick={() => openDetailModal(task)} 
                          className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                        >
                          <svg className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          <span>Detail</span>
                        </button>

                        {/* Delete Button (Admin Only) */}
                        {isAdmin && (
                          <button 
                            onClick={() => handleDeleteTask(task.id)} 
                            className="px-2 py-1 md:px-3 md:py-1.5 text-xs md:text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg flex items-center transition duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:ring-offset-white dark:focus:ring-offset-gray-800"
                          >
                            <svg className="w-3 h-3 md:w-4 md:h-4 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                            <span>Hapus</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Tambah Tugas - responsive */}
          {isAddTaskModalOpen && (
            <dialog id="add_task_modal" className="modal modal-open">
              <div className="modal-box w-11/12 max-w-lg md:w-4/5 p-4 md:p-6">
                <h3 className="font-bold text-base md:text-lg mb-3 md:mb-4">Tambah Tugas Baru</h3>
                <form onSubmit={handleCreateTask}>
                  <div className="form-control mb-3 md:mb-4">
                    <label className="label py-1 md:py-2">
                      <span className="label-text text-sm md:text-base">Judul Tugas</span>
                    </label>
                    <input
                      type="text"
                      name="judul"
                      placeholder="Masukkan judul tugas"
                      className="input input-bordered w-full text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4 h-auto"
                      value={formData.judul}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-control mb-3 md:mb-4">
                    <label className="label py-1 md:py-2">
                      <span className="label-text text-sm md:text-base">Deskripsi Tugas</span>
                    </label>
                    <textarea
                      name="deskripsi"
                      placeholder="Masukkan deskripsi tugas"
                      className="textarea textarea-bordered w-full h-20 md:h-24 text-sm md:text-base py-2 md:py-2.5 px-3 md:px-4"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                    ></textarea>
                  </div>

                  {/* Pemilihan Pegawai untuk Penugasan (admin only) */}
                  {isAdmin && allUsers.length > 0 && (
                    <div className="form-control mb-3 md:mb-4">
                      <label className="label py-1 md:py-2">
                        <span className="label-text text-sm md:text-base">Tugaskan kepada:</span>
                      </label>
                      <div className="flex flex-wrap gap-1 md:gap-2 max-h-32 md:max-h-40 overflow-y-auto border p-1.5 md:p-2 rounded-md bg-base-200">
                        {allUsers.map(u => (
                          <div key={u.id} className="form-control">
                            <label className="label cursor-pointer py-1 md:py-2">
                              <span className="label-text text-xs md:text-sm mr-1.5 md:mr-2">{u.name || u.username} ({u.role})</span>
                              <input
                                type="checkbox"
                                checked={formData.pegawai_ids.includes(u.id)}
                                onChange={() => handleUserSelection(u.id)}
                                className="checkbox checkbox-primary checkbox-sm md:checkbox-md"
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Untuk pegawai, otomatis assign ke dirinya sendiri */}
                  {user?.role === 'pegawai' && (
                    <div className="form-control mb-3 md:mb-4">
                      <label className="label py-1 md:py-2">
                        <span className="label-text text-sm md:text-base">Tugaskan kepada:</span>
                      </label>
                      <div className="badge badge-info text-xs md:text-sm">Diri sendiri</div>
                    </div>
                  )}

                  <div className="modal-action mt-4 md:mt-6 flex justify-end gap-2 md:gap-3">
                    <button type="submit" className="btn btn-primary btn-sm md:btn-md text-xs md:text-sm" disabled={loading}>
                      {loading ? <span className="loading loading-spinner loading-xs md:loading-sm"></span> : 'Buat Tugas'}
                    </button>
                    <button type="button" className="btn btn-sm md:btn-md text-xs md:text-sm" onClick={closeAddTaskModal}>Batal</button>
                  </div>
                </form>
              </div>
            </dialog>
          )}

          {/* Modal Detail Tugas */}
          {showTaskDetailModal && selectedTask && (
            <TaskDetailModal 
              task={selectedTask} 
              onClose={closeDetailModal}
              onTaskUpdated={handleTaskUpdatedInModal} 
              showModal={showTaskDetailModal}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TasksPage;