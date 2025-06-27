// frontend/src/pages/TasksPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getTasks, createTask, updateTask, deleteTask, getUsers as getAllUsersForTaskCreation } from '../services/taskService';
import { useAuth } from '../contexts/AuthContext';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Untuk daftar semua pengguna yang akan ditugaskan di form buat tugas baru
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [selectedUsersForNewTask, setSelectedUsersForNewTask] = useState([]);

  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { user, isAdmin, isLoading: authLoading } = useAuth(); // Destrukturisasi user, isAdmin, dan authLoading dari AuthContext

  useEffect(() => {
    // Hanya panggil fetchInitialData jika AuthContext sudah selesai loading
    // dan objek user sudah teridentifikasi (atau jika user adalah null setelah loading selesai)
    if (!authLoading) {
      fetchInitialData();
    }
  }, [authLoading, user]); // Tambahkan authLoading dan user sebagai dependensi

  const fetchInitialData = async () => {
    setLoading(true); // Set loading untuk TasksPage
    setError(null);
    try {
      const [tasksData] = await Promise.all([
        getTasks() // Ini akan selalu dijalankan
      ]);

      let usersData = [];
      // === DIPERBAIKI: Hanya panggil getAllUsersForTaskCreation jika user adalah admin ===
      if (user && user.role === 'admin') { // Gunakan 'user' untuk cek role
        try {
          usersData = await getAllUsersForTaskCreation(); // Ini yang memanggil /api/users
        } catch (usersFetchError) {
          // Jika pengambilan data pengguna gagal (misal 403 untuk non-admin),
          // cukup log error dan jangan set setError global agar page tetap tampil
          console.error("Error fetching all users for assignment (might be non-admin access):", usersFetchError);
          // Interceptor Axios di api.js sudah menangani logout jika itu 401/403
        }
      }
      // === AKHIR DIPERBAIKI ===

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
      setAllUsers(usersData); // Ini akan menjadi array kosong untuk non-admin, yang mana tidak masalah
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memuat data awal (tugas/pengguna). Silakan coba lagi.');
      console.error('Fetch initial data error:', err);
    } finally {
      setLoading(false); // Selesaikan loading untuk TasksPage
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!user) { // Pengecekan user di awal handler
      setError('Anda harus login untuk membuat tugas.');
      console.error('Create task failed: User not authenticated.');
      return;
    }

    if (!newTaskTitle.trim()) {
      setError('Judul tugas tidak boleh kosong.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const taskPayload = {
        judul: newTaskTitle,
        deskripsi: newTaskDescription,
        // user.role dan user.id aman diakses sekarang
        pegawai_ids: user.role === 'admin' ? selectedUsersForNewTask : [user.id]
      };
      await createTask(taskPayload);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setSelectedUsersForNewTask([]);
      fetchInitialData(); // Refresh daftar tugas dan user
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal membuat tugas. Silakan coba lagi.');
      console.error('Create task error:', err);
    } finally {
      setLoading(false);
    }
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

  const handleUserSelectionForNewTask = (userId) => {
    setSelectedUsersForNewTask(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  if (loading || authLoading) { // Gabungkan kondisi loading dari TasksPage dan AuthContext
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-6">Manajemen Tugas</h1>

          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form Tambah Tugas */}
          <div className="card bg-base-100 shadow-xl p-6 mb-8">
            <h2 className="card-title text-xl mb-4">Tambah Tugas Baru</h2>
            <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Judul Tugas"
                className="input input-bordered w-full"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Deskripsi Tugas"
                className="textarea textarea-bordered h-24 w-full"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              ></textarea>

              {/* Pemilihan Pegawai untuk Penugasan Tugas Baru */}
              {isAdmin && allUsers.length > 0 && ( // <--- UBAH ke isAdmin
                <div className="form-control">
                  <label className="label"><span className="label-text">Tugaskan kepada:</span></label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-base-200">
                    {allUsers.map(u => (
                      <div key={u.id} className="form-control">
                        <label className="label cursor-pointer">
                          <span className="label-text mr-2">{u.name || u.username} ({u.role})</span>
                          <input
                            type="checkbox"
                            checked={selectedUsersForNewTask.includes(u.id)}
                            onChange={() => handleUserSelectionForNewTask(u.id)}
                            className="checkbox checkbox-primary"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {user?.role === 'pegawai' && ( // Ini biarkan saja, karena ini cek spesifik untuk pegawai
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tugaskan kepada:</span>
                    </label>
                    <div className="badge badge-info">Diri sendiri</div>
                  </div>
                )}


              <button type="submit" className="btn btn-primary w-full">Buat Tugas</button>
            </form>
          </div>

          {/* Daftar Tugas */}
          <h2 className="text-3xl font-bold text-base-content mb-4">Daftar Tugas Anda</h2>
          {tasks.length === 0 ? (
            <div className="text-center text-lg text-base-content">Tidak ada tugas ditemukan.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map(task => (
                <div key={task.id} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h2 className="card-title text-base-content">{task.judul}</h2>
                    <p className="text-sm text-gray-600">{task.deskripsi}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <div className={`badge ${task.status === 'done' ? 'badge-success' : task.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>Status: {task.status}</div>
                      <div className={`badge ${task.prioritas === 'high' ? 'badge-error' : task.prioritas === 'medium' ? 'badge-warning' : 'badge-ghost'}`}>Prioritas: {task.prioritas}</div>
                      <div className="badge badge-outline">Kategori: {task.category_name}</div>
                      <div className="badge badge-outline">Deadline: {task.due_date}</div>
                    </div>
                    <p className="text-sm text-gray-700 mt-2">Ditugaskan kepada: {task.assigned_to_names}</p>
                    <div className="card-actions justify-end mt-4">
                      {/* Dropdown untuk mengubah status */}
                      <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-sm btn-info">Ubah Status</div>
                        <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                          <li><a onClick={() => handleUpdateStatus(task.id, 'to_do')}>To Do</a></li>
                          <li><a onClick={() => handleUpdateStatus(task.id, 'in_progress')}>In Progress</a></li>
                          <li><a onClick={() => handleUpdateStatus(task.id, 'done')}>Done</a></li>
                          <li><a onClick={() => handleUpdateStatus(task.id, 'archived')}>Archived</a></li>
                        </ul>
                      </div>

                      {/* Tombol Lihat Detail */}
                      <button onClick={() => openDetailModal(task)} className="btn btn-sm btn-outline btn-primary">Detail</button>

                      {/* Tombol Hapus (hanya untuk Admin) */}
                      {isAdmin && ( // <--- UBAH ke isAdmin
                        <button onClick={() => handleDeleteTask(task.id)} className="btn btn-sm btn-error">Hapus</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Modal Detail Tugas */}
          {showTaskDetailModal && selectedTask && (
            <TaskDetailModal 
              task={selectedTask} 
              onClose={closeDetailModal}
              onTaskUpdated={handleTaskUpdatedInModal} 
              showModal={showTaskDetailModal} // Passing showModal prop
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default TasksPage;