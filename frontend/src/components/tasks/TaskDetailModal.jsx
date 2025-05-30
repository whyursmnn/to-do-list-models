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
      
      const updatedTaskResponse = await updateTask(currentTask.id, updatedData);
      setCurrentTask(updatedTaskResponse); 
      onTaskUpdated(updatedTaskResponse); 
      alert('Detail tugas berhasil diperbarui!');
      setActiveTab('detail'); 
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
        <h3 className="font-bold text-2xl mb-4 text-base-content">{currentTask.judul}</h3>
        <p className="py-2 text-sm text-gray-600">ID Tugas: {currentTask.id}</p>

        {user && (
          <p className="py-1 text-sm text-gray-600">
            Anda masuk sebagai: <span className="font-semibold">{user.name || user.username} ({user.role})</span>
          </p>
        )}

        {error && (
          <div role="alert" className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        {/* Tabs for modal navigation */}
        <div className="tabs tabs-boxed mb-4">
          <a className={`tab ${activeTab === 'detail' ? 'tab-active' : ''}`} onClick={() => setActiveTab('detail')}>Detail</a>
          <a className={`tab ${activeTab === 'edit' ? 'tab-active' : ''}`} onClick={() => setActiveTab('edit')}>Edit Tugas</a> {/* NEW TAB for editing core task details */}
          <a className={`tab ${activeTab === 'comments' ? 'tab-active' : ''}`} onClick={() => setActiveTab('comments')}>Komentar</a>
          <a className={`tab ${activeTab === 'attachments' ? 'tab-active' : ''}`} onClick={() => setActiveTab('attachments')}>Lampiran</a>
          <a className={`tab ${activeTab === 'history' ? 'tab-active' : ''}`} onClick={() => setActiveTab('history')}>Riwayat Status</a>
          {isAdmin && <a className={`tab ${activeTab === 'assign' ? 'tab-active' : ''}`} onClick={() => setActiveTab('assign')}>Tugaskan</a>}
        </div>

        {loading && <div className="text-center my-4"><span className="loading loading-spinner loading-lg"></span> Loading...</div>}

        {/* === Content for 'Detail' Tab === */}
        {!loading && activeTab === 'detail' && (
          <div>
            <p className="text-lg font-semibold">Deskripsi:</p>
            <p className="mb-2">{currentTask.deskripsi || 'Tidak ada deskripsi.'}</p>
            <p className="text-lg font-semibold">Prioritas: <span className={`badge ${currentTask.prioritas === 'high' ? 'badge-error' : currentTask.prioritas === 'medium' ? 'badge-warning' : 'badge-ghost'}`}>{currentTask.prioritas}</span></p>
            <p className="text-lg font-semibold">Status: <span className={`badge ${currentTask.status === 'done' ? 'badge-success' : currentTask.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>{currentTask.status}</span></p>
            <p className="text-lg font-semibold">Kategori: {currentTask.category_name}</p>
            <p className="text-lg font-semibold">Deadline: {currentTask.due_date}</p>
            <p className="text-lg font-semibold">Dibuat Oleh: {currentTask.dibuat_oleh_user?.name || currentTask.dibuat_oleh_user?.username || 'N/A'}</p>
            <p className="text-lg font-semibold">Ditugaskan Kepada: {currentTask.assigned_to_names}</p>
          </div>
        )}

        {/* === NEW: Content for 'Edit Task' Tab === */}
        {!loading && activeTab === 'edit' && (
          <form onSubmit={handleUpdateTaskDetails} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text">Judul Tugas</span></label>
              <input type="text" placeholder="Judul" className="input input-bordered w-full"
                value={editJudul} onChange={(e) => setEditJudul(e.target.value)} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Deskripsi</span></label>
              <textarea placeholder="Deskripsi" className="textarea textarea-bordered h-24 w-full"
                value={editDeskripsi} onChange={(e) => setEditDeskripsi(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Prioritas</span></label>
              <select className="select select-bordered w-full"
                value={editPrioritas} onChange={(e) => setEditPrioritas(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Tanggal Mulai</span></label>
              <input type="date" className="input input-bordered w-full"
                value={editTanggalMulai} onChange={(e) => setEditTanggalMulai(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Tanggal Selesai</span></label>
              <input type="date" className="input input-bordered w-full"
                value={editTanggalSelesai} onChange={(e) => setEditTanggalSelesai(e.target.value)} />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">Kategori</span></label>
              <select className="select select-bordered w-full"
                value={editKategoriId} onChange={(e) => setEditKategoriId(e.target.value)}>
                <option value="">Pilih Kategori</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nama}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : "Simpan Perubahan Tugas"}
            </button>
          </form>
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