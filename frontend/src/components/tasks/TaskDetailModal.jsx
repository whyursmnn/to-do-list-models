// frontend/src/components/tasks/TaskDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { updateTask, getTaskStatusHistory, getUsers as getAllUsersFromTaskService } from '../../services/taskService'; // getCategories DIHAPUS dari sini
import { getCommentsForTask, createComment, deleteComment } from '../../services/commentService';
import { getAttachmentsForTask, uploadAttachment, deleteAttachment } from '../../services/attachmentService';
import { getCategories } from '../../services/categoryService'; // <-- TAMBAHKAN IMPOR INI DARI categoryService.js
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
const TaskDetailModal = ({ task, onClose, onTaskUpdated, showModal }) => {
  const { user, isAdmin } = useAuth();
  
  // UI State
  const [activeTab, setActiveTab] = useState('detail');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Task State  
  const [currentTask, setCurrentTask] = useState(task);
  const [editJudul, setEditJudul] = useState(task.judul);
  const [editDeskripsi, setEditDeskripsi] = useState(task.deskripsi);
  const [editPrioritas, setEditPrioritas] = useState(task.prioritas);
  const [editTanggalMulai, setEditTanggalMulai] = useState(task.tanggal_mulai ? new Date(task.tanggal_mulai).toISOString().split('T')[0] : '');
  const [editTanggalSelesai, setEditTanggalSelesai] = useState(task.tanggal_selesai ? new Date(task.tanggal_selesai).toISOString().split('T')[0] : '');
  const [editKategoriId, setEditKategoriId] = useState(task.kategori_id || ''); // Use ID

  
  const [comments, setComments] = useState([]);
  const [newCommentText, setNewCommentText] = useState('');

   
  const [attachments, setAttachments] = useState([]);
  const [newAttachmentFile, setNewAttachmentFile] = useState(null);
  const [newAttachmentDescription, setNewAttachmentDescription] = useState('');

  
  const [statusHistory, setStatusHistory] = useState([]);
  const [allUsers, setAllUsers] = useState([]); 
  const [selectedAssignees, setSelectedAssignees] = useState(
    currentTask.penugasan_tugas?.map(pa => pa.pegawai_user.id) || []
  );
  const [allCategories, setAllCategories] = useState([]); 

  
  useEffect(() => {
    if (showModal && task) {
      setError(null); 
      setLoading(true);
      if (activeTab === 'comments') fetchComments();
      else if (activeTab === 'attachments') fetchAttachments();
      else if (activeTab === 'history') fetchStatusHistory();
      else if (activeTab === 'assign' && isAdmin) fetchAllUsers(); 
      else if (activeTab === 'edit') fetchAllCategories(); 
      else {
        setLoading(false); 
      }
    }
  }, [activeTab, task, showModal, isAdmin]);

  
  const fetchComments = async () => {
    setLoading(true);
    try {
      const data = await getCommentsForTask(task.id);
      setComments(data);
    } catch (err) {
      setError('Gagal memuat komentar.');
      console.error('Fetch comments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttachments = async () => {
    setLoading(true);
    try {
      const data = await getAttachmentsForTask(task.id);
      setAttachments(data);
    } catch (err) {
      setError('Gagal memuat lampiran.');
      console.error('Fetch attachments error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusHistory = async () => {
    setLoading(true);
    try {
      const data = await getTaskStatusHistory(task.id);
      setStatusHistory(data);
    } catch (err) {
      setError('Gagal memuat riwayat status.');
      console.error('Fetch status history error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsersFromTaskService(); 
      setAllUsers(data);
    } catch (err) {
      setError('Gagal memuat daftar pengguna.');
      console.error('Fetch all users error (for assignment):', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAllCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories(); 
      setAllCategories(data);
    } catch (err) {
      setError('Gagal memuat daftar kategori.');
      console.error('Fetch categories error (for task edit):', err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !currentTask) return; 
    setLoading(true);
    setError(null);
    try {
      await createComment({ tugas_id: currentTask.id, komentar: newCommentText });
      setNewCommentText('');
      fetchComments(); 
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menambahkan komentar.');
      console.error('Add comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Yakin ingin menghapus komentar ini?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteComment(commentId);
      fetchComments(); 
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menghapus komentar.');
      console.error('Delete comment error:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleUploadAttachment = async (e) => {
    e.preventDefault();
    if (!newAttachmentFile || !currentTask) {
      setError('Pilih file untuk diunggah.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await uploadAttachment(currentTask.id, newAttachmentFile, newAttachmentDescription);
      setNewAttachmentFile(null);
      setNewAttachmentDescription('');
      e.target.reset(); 
      fetchAttachments(); 
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal mengunggah lampiran.');
      console.error('Upload attachment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Yakin ingin menghapus lampiran ini?')) return;
    setLoading(true);
    setError(null);
    try {
      await deleteAttachment(attachmentId);
      fetchAttachments(); 
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menghapus lampiran.');
      console.error('Delete attachment error:', err);
    } finally {
      setLoading(false);
    }
  };

 
  const handleAssigneesChange = (userId) => {
    setSelectedAssignees(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSaveAssignees = async () => {
    setLoading(true);
    setError(null);
    try {
      
      const updatedTaskResponse = await updateTask(currentTask.id, { pegawai_ids: selectedAssignees });
      setCurrentTask(updatedTaskResponse); 
      onTaskUpdated(updatedTaskResponse); 
      alert('Penugasan berhasil diperbarui!');
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memperbarui penugasan. Silakan coba lagi.');
      console.error('Save assignees error:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const handleUpdateTaskDetails = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updatedData = {
        judul: editJudul,
        deskripsi: editDeskripsi,
        prioritas: editPrioritas,
        tanggal_mulai: editTanggalMulai || null, 
        tanggal_selesai: editTanggalSelesai || null, 
        kategori_id: editKategoriId ? parseInt(editKategoriId) : null, 
      };
      
      // Simpan response dari API
      const updatedTaskResponse = await updateTask(currentTask.id, updatedData);
      
      // Buat objek task yang benar-benar terupdate dengan menggabungkan data lama dan baru
      const completeUpdatedTask = {
        ...currentTask,  // Mempertahankan semua data lama termasuk dibuat_oleh_user
        ...updatedData,  // Menambahkan data yang diedit
        // Jika API mengembalikan data dibuat_oleh_user, gunakan itu, jika tidak pertahankan data lama
        dibuat_oleh_user: updatedTaskResponse?.dibuat_oleh_user || currentTask.dibuat_oleh_user,
        // Tambahkan fields lain yang mungkin diperbarui dari API
        ...(updatedTaskResponse || {})
      };
      
      console.log('Data pembuat tugas:', completeUpdatedTask.dibuat_oleh_user); // Untuk debugging
      
      // Update state lokal dengan data yang sudah lengkap
      setCurrentTask(completeUpdatedTask);
      
      // Kirim data yang sudah lengkap ke parent component 
      onTaskUpdated(completeUpdatedTask);
      
      // Tampilkan notifikasi berhasil
      alert('Detail tugas berhasil diperbarui!');
      
      onClose(); // Tutup modal setelah update sukses
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memperbarui detail tugas. Silakan coba lagi.');
      console.error('Update task details error:', err);
    } finally {
      setLoading(false);
    }
  };


  if (!task) return null; 

  return (
    <dialog id="task_detail_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-5xl">
        {/* Task Title and Header Section */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
          <h3 className="font-bold text-2xl text-gray-800 dark:text-gray-100 flex items-center">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
            {currentTask.judul}
          </h3>
          
          <div className="mt-3 flex flex-wrap items-center gap-4">
            {/* Task ID */}
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
              <svg className="w-3.5 h-3.5 mr-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path>
              </svg>
              ID: {currentTask.id}
            </div>

            {/* User Info */}
            {user && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span className="text-gray-600 dark:text-gray-400">Login sebagai:</span> 
                <span className="font-semibold ml-1 text-gray-900 dark:text-gray-200">{user.name || user.username}</span>
                <span className="ml-1 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-400 text-xs">{user.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/30 p-4 border-l-4 border-red-500 dark:border-red-500">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modern Tabs for Navigation */}
        <div className="mb-6">
          <nav className="flex -mb-px space-x-1 overflow-x-auto hide-scrollbar" aria-label="Task tabs">
            <button
              onClick={() => setActiveTab('detail')}
              className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'detail'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Detail
            </button>

            <button
              onClick={() => setActiveTab('edit')}
              className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'edit'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
              Edit Tugas
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
              </svg>
              Komentar
            </button>

            <button
              onClick={() => setActiveTab('attachments')}
              className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'attachments'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
              Lampiran
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
              } transition-colors`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Riwayat Status
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab('assign')}
                className={`py-3 px-4 inline-flex items-center text-sm font-medium border-b-2 whitespace-nowrap ${
                  activeTab === 'assign'
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                } transition-colors`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
                Tugaskan
              </button>
            )}
          </nav>
        </div>

        {loading && <div className="text-center my-4"><span className="loading loading-spinner loading-lg"></span> Loading...</div>}

        {/* === Content for 'Detail' Tab === */}
        {!loading && activeTab === 'detail' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 mt-4 shadow-sm border border-gray-100 dark:border-gray-800">
            {/* Task Description Section */}
            <div className="mb-6">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                Deskripsi
              </h4>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {currentTask.deskripsi || 
                    <span className="italic text-gray-500 dark:text-gray-400">Tidak ada deskripsi.</span>
                  }
                </p>
              </div>
            </div>

            {/* Task Meta Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              {/* Priority */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Prioritas
                </h4>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${currentTask.prioritas === 'high' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                      : currentTask.prioritas === 'medium' 
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}
                  >
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={
                        currentTask.prioritas === 'high' 
                          ? "M13 10V3L4 14h7v7l9-11h-7z" 
                          : currentTask.prioritas === 'medium' 
                            ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                            : "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      }></path>
                    </svg>
                    {currentTask.prioritas === 'high' ? 'Tinggi' : 
                    currentTask.prioritas === 'medium' ? 'Sedang' : 'Rendah'}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Status
                </h4>
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${currentTask.status === 'done' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : currentTask.status === 'in_progress' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                        : currentTask.status === 'archived' 
                          ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}`}
                  >
                    <span className={`w-2 h-2 rounded-full mr-1.5
                      ${currentTask.status === 'done' 
                        ? 'bg-green-500' 
                        : currentTask.status === 'in_progress' 
                          ? 'bg-blue-500' 
                          : currentTask.status === 'archived' 
                            ? 'bg-gray-500' 
                            : 'bg-purple-500'}`}
                    />
                    {currentTask.status === 'to_do' ? 'To Do' : 
                    currentTask.status === 'in_progress' ? 'In Progress' : 
                    currentTask.status === 'done' ? 'Done' : 'Archived'}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Kategori
                </h4>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                  </svg>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {currentTask.category_name || 'Tidak dikategorikan'}
                  </span>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Deadline
                </h4>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {currentTask.due_date || 'Tidak ada deadline'}
                  </span>
                </div>
              </div>

              {/* Created By */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Dibuat Oleh
                </h4>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {currentTask.dibuat_oleh_user?.name || currentTask.dibuat_oleh_user?.username || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Assigned To */}
              <div className="flex flex-col">
                <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-1">
                  Ditugaskan Kepada
                </h4>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                  <span className="text-gray-800 dark:text-gray-200 font-medium">
                    {currentTask.assigned_to_names || 'Belum ditugaskan'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* === Content for 'Edit Task' Tab === */}
        {!loading && activeTab === 'edit' && (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            {/* Task Edit Form Header */}
            <div className="flex flex-wrap items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center mb-2 md:mb-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">Edit Detail Tugas</h3>
              </div>
            </div>
          
            <form onSubmit={handleUpdateTaskDetails} className="space-y-6">
              {/* Task Title Field */}
              <div className="form-control">
                <label htmlFor="edit-task-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Judul Tugas
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="edit-task-title"
                    placeholder="Masukkan judul tugas"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={editJudul}
                    onChange={(e) => setEditJudul(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Task Description Field */}
              <div className="form-control">
                <label htmlFor="edit-task-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deskripsi
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                  </div>
                  <textarea
                    id="edit-task-description"
                    rows="4"
                    placeholder="Masukkan deskripsi tugas"
                    className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    value={editDeskripsi}
                    onChange={(e) => setEditDeskripsi(e.target.value)}
                  ></textarea>
                </div>
              </div>
              
              {/* Two column grid for shorter fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Priority Field */}
                <div className="form-control">
                  <label htmlFor="edit-task-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prioritas
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <select
                      id="edit-task-priority"
                      className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 appearance-none"
                      value={editPrioritas}
                      onChange={(e) => setEditPrioritas(e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Priority Indicator */}
                  <div className="mt-2 flex items-center">
                    <span 
                      className={`inline-block w-3 h-3 rounded-full mr-2 ${
                        editPrioritas === 'high' 
                          ? 'bg-red-500' 
                          : editPrioritas === 'medium' 
                            ? 'bg-amber-500' 
                            : 'bg-green-500'
                      }`}
                    ></span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {editPrioritas === 'high' 
                        ? 'Prioritas Tinggi' 
                        : editPrioritas === 'medium' 
                          ? 'Prioritas Sedang' 
                          : 'Prioritas Rendah'}
                    </span>
                  </div>
                </div>
                
                {/* Category Field */}
                <div className="form-control">
                  <label htmlFor="edit-task-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Kategori
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <select
                      id="edit-task-category"
                      className="block w-full pl-10 pr-10 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 appearance-none"
                      value={editKategoriId}
                      onChange={(e) => setEditKategoriId(e.target.value)}
                    >
                      <option value="">Pilih Kategori</option>
                      {allCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.nama}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Two column grid for dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date Field */}
                <div className="form-control">
                  <label htmlFor="edit-task-start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Mulai
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="edit-task-start-date"
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={editTanggalMulai}
                      onChange={(e) => setEditTanggalMulai(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* End Date Field */}
                <div className="form-control">
                  <label htmlFor="edit-task-end-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tanggal Selesai
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="date"
                      id="edit-task-end-date"
                      className="block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      value={editTanggalSelesai}
                      onChange={(e) => setEditTanggalSelesai(e.target.value)}
                    />
                  </div>
                  
                  {/* Date Range Indicator */}
                  {editTanggalMulai && editTanggalSelesai && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                        {Math.ceil((new Date(editTanggalSelesai) - new Date(editTanggalMulai)) / (1000 * 60 * 60 * 24))} hari
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Task Action Bar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  type="submit" 
                  className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2.5 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 sm:text-sm transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Simpan Perubahan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* === Content for 'Comments' Tab === */}
        {!loading && activeTab === 'comments' && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Komentar</h4>
            <div className="space-y-4 max-h-60 overflow-y-auto p-2 bg-base-200 rounded">
              {comments.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada komentar.</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="chat chat-start">
                    <div className="chat-image avatar">
                      <div className="w-10 rounded-full">
                        <img alt="User Avatar" src="https://daisyui.com/images/stock/photo-1534528736684-ce498b5da6ad.jpg" />
                      </div>
                    </div>
                    <div className="chat-header">
                      {comment.user ? (comment.user.name || comment.user.username) : 'Anonim'}
                      <time className="text-xs opacity-50 ml-2">{new Date(comment.created_at).toLocaleString()}</time>
                    </div>
                    <div className="chat-bubble">{comment.komentar}</div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="btn btn-xs btn-error mt-1">Hapus</button>
                    )}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleAddComment} className="mt-4 flex gap-2">
              <input
                type="text"
                placeholder="Tambah komentar baru..."
                className="input input-bordered flex-grow"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                required
              />
              <button type="submit" className="btn btn-primary">Kirim</button>
            </form>
          </div>
        )}

        {/* === Content for 'Attachments' Tab === */}
        {!loading && activeTab === 'attachments' && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Lampiran</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto p-2 bg-base-200 rounded">
              {attachments.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada lampiran.</p>
              ) : (
                attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 border rounded-md bg-base-100">
                    <div>
                      {/* Pastikan VITE_API_BASE_URL Anda mengarah ke 127.0.0.1:8000 */}
                      <a href={`http://127.0.0.1:8000${att.file_url}`} target="_blank" rel="noopener noreferrer" className="link link-primary">
                        {att.file_url ? att.file_url.split('/').pop() : 'File'}
                      </a>
                      <p className="text-sm text-gray-500">{att.deskripsi}</p>
                      <p className="text-xs text-gray-400">Diunggah oleh: {att.uploaded_by_user?.name || att.uploaded_by_user?.username || 'N/A'} pada {new Date(att.uploaded_at).toLocaleString()}</p>
                    </div>
                    {isAdmin && (
                      <button onClick={() => handleDeleteAttachment(att.id)} className="btn btn-xs btn-error">Hapus</button>
                    )}
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleUploadAttachment} className="mt-4 flex flex-col gap-2">
              <input
                type="file"
                className="file-input file-input-bordered w-full"
                onChange={(e) => setNewAttachmentFile(e.target.files[0])}
                required
              />
              <input
                type="text"
                placeholder="Deskripsi Lampiran (opsional)"
                className="input input-bordered w-full"
                value={newAttachmentDescription}
                onChange={(e) => setNewAttachmentDescription(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Unggah Lampiran</button>
            </form>
          </div>
        )}

        {/* === Content for 'History' Tab === */}
        {!loading && activeTab === 'history' && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Riwayat Status Tugas</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-base-200 rounded">
              {statusHistory.length === 0 ? (
                <p className="text-center text-gray-500">Belum ada riwayat status.</p>
              ) : (
                statusHistory.map(history => (
                  <div key={history.id} className="p-2 border rounded-md bg-base-100 flex items-center justify-between">
                    <div>
                      Status diubah dari <span className="font-bold">{history.status_lama || 'Tidak Diketahui'}</span> menjadi <span className="font-bold">{history.status_baru}</span>
                      <p className="text-sm text-gray-500">Oleh: {history.diubah_oleh_user?.name || history.diubah_oleh_user?.username || 'N/A'} pada {new Date(history.waktu_ubah).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* === Content for 'Assign' Tab === */}
        {!loading && activeTab === 'assign' && isAdmin && (
          <div>
            <h4 className="font-semibold text-lg mb-2">Tugaskan Tugas kepada Pengguna</h4>
            <div className="form-control max-h-60 overflow-y-auto p-2 bg-base-200 rounded">
              {allUsers.length === 0 ? (
                <p className="text-center text-gray-500">Tidak ada pengguna yang tersedia.</p>
              ) : (
                allUsers.map(userItem => (
                  <label key={userItem.id} className="label cursor-pointer">
                    <span className="label-text">{userItem.name || userItem.username} ({userItem.role})</span>
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={selectedAssignees.includes(userItem.id)}
                      onChange={() => handleAssigneesChange(userItem.id)}
                    />
                  </label>
                ))
              )}
            </div>
            <button onClick={handleSaveAssignees} className="btn btn-primary mt-4 w-full" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : "Simpan Penugasan"}
            </button>
          </div>
        )}

        <div className="modal-action">
          <button type="button" onClick={onClose} className="btn">Tutup</button>
        </div>
      </div>
    </dialog>
  );
};

export default TaskDetailModal;