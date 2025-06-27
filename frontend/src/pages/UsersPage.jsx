// frontend/src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService'; // Import user service functions

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the add/edit modal
  const [editingUser, setEditingUser] = useState(null); // Stores user object if in edit mode

  // Form states for create/edit
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'pegawai', // Default role
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memuat daftar pengguna.');
      console.error('Fetch users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateOrUpdateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userData = { ...formData };
      if (!userData.password) { // Don't send password if empty on update
        delete userData.password;
      }

      if (editingUser) {
        await updateUser(editingUser.id, userData);
      } else {
        await createUser(userData);
      }
      fetchUsers(); // Refresh list
      closeModal(); // Close modal
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menyimpan pengguna. Silakan coba lagi.');
      console.error('Save user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? (Soft Delete)')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await deleteUser(userId);
      fetchUsers(); // Refresh list
    } catch (err) {
      setError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal menghapus pengguna. Pastikan Anda memiliki izin.');
      console.error('Delete user error:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', role: 'pegawai' });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '', // Password fields are never pre-filled for security
      name: user.name,
      role: user.role,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({ username: '', password: '', name: '', role: 'pegawai' });
    setError(null);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-6">Manajemen Pengguna</h1>

          {error && (
            <div role="alert" className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-6">
            <button onClick={openCreateModal} className="btn btn-primary">Tambah Pengguna Baru</button>
          </div>

          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Nama</th>
                  <th>Peran</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.name}</td>
                    <td>{user.role}</td>
                    <td>{user.is_deleted ? <span className="badge badge-error">Dihapus</span> : <span className="badge badge-success">Aktif</span>}</td>
                    <td>
                      <button onClick={() => openEditModal(user)} className="btn btn-sm btn-warning mr-2">Edit</button>
                      {!user.is_deleted && ( // Allow delete only if not already deleted
                         <button onClick={() => handleDeleteUser(user.id)} className="btn btn-sm btn-error">Hapus</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal Tambah/Edit Pengguna */}
          {isModalOpen && (
            <dialog id="user_modal" className="modal modal-open">
              <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                <form onSubmit={handleCreateOrUpdateUser}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Username</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      className="input input-bordered w-full"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingUser} // Username cannot be changed when editing
                    />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Password {editingUser ? '(Kosongkan jika tidak diubah)' : ''}</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="input input-bordered w-full"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser} // Required for new user, optional for edit
                    />
                  </div>
                   <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Nama Lengkap</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama Lengkap"
                      className="input input-bordered w-full"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Peran</span>
                    </label>
                    <select
                      name="role"
                      className="select select-bordered w-full"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pegawai">Pegawai</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-action">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? <span className="loading loading-spinner"></span> : (editingUser ? 'Simpan Perubahan' : 'Buat Pengguna')}
                    </button>
                    <button type="button" className="btn" onClick={closeModal}>Batal</button>
                  </div>
                </form>
              </div>
            </dialog>
          )}

        </main>
      </div>
    </div>
  );
};

export default UsersPage;