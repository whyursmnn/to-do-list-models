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
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar toggle on mobile

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
    <div className="flex h-screen w-screen bg-base-200 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar component with open state */}
      <Sidebar isSidebarOpen={sidebarOpen} closeSidebar={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col">
        <Navbar openSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-base-content mb-4 md:mb-6">Manajemen Pengguna</h1>

          {error && (
            <div role="alert" className="alert alert-error text-sm md:text-base mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}

          <div className="mb-4 md:mb-6">
            <button onClick={openCreateModal} className="btn btn-primary btn-sm md:btn-md">Tambah Pengguna Baru</button>
          </div>

          <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md">
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                {/* Table Header */}
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {/* ID column - hidden on small screens */}
                    <th scope="col" className="hidden md:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Username
                    </th>
                    {/* Nama column - hide on smallest screens */}
                    <th scope="col" className="hidden sm:table-cell px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nama
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Peran
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 md:px-6 py-2 md:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <tr 
                        key={user.id} 
                        className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-150`}
                      >
                        {/* ID column - hidden on small screens */}
                        <td className="hidden md:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.id}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 dark:text-gray-300">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-6 w-6 md:h-8 md:w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                              <span className="font-medium text-blue-600 dark:text-blue-400">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-2 md:ml-3 font-medium">
                              {user.username}
                            </div>
                          </div>
                        </td>
                        {/* Nama column - hide on smallest screens */}
                        <td className="hidden sm:table-cell px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-xs md:text-sm text-gray-700 dark:text-gray-300">
                          {user.name || <span className="italic text-gray-400 dark:text-gray-500">Tidak diatur</span>}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium 
                            ${user.role === 'admin' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                            {user.role === 'admin' ? (
                              <svg className="w-3 h-3 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                              </svg>
                            )}
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap">
                          {user.is_deleted ? (
                            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              <svg className="w-3 h-3 mr-0.5 md:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                              </svg>
                              Dihapus
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 md:px-2.5 md:py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <svg className="w-3 h-3 mr-0.5 md:mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                              </svg>
                              Aktif
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 whitespace-nowrap text-right text-xs md:text-sm font-medium">
                          <div className="flex justify-end gap-1 md:gap-2">
                            <button
                              onClick={() => openEditModal(user)}
                              className="inline-flex items-center px-2 py-1 md:px-2.5 md:py-1.5 border border-transparent text-xs font-medium rounded-md bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-900 transition-colors duration-150"
                            >
                              <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                              <span className="hidden sm:inline">Edit</span>
                            </button>
                            {!user.is_deleted && (
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="inline-flex items-center px-2 py-1 md:px-2.5 md:py-1.5 border border-transparent text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900 transition-colors duration-150"
                              >
                                <svg className="w-3 h-3 md:w-3.5 md:h-3.5 mr-0.5 md:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                                <span className="hidden sm:inline">Hapus</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 md:px-6 py-8 md:py-10 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex flex-col items-center">
                          <svg className="w-10 h-10 md:w-12 md:h-12 text-gray-300 dark:text-gray-600 mb-2 md:mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                          </svg>
                          <p>Tidak ada data pengguna</p>
                          <button 
                            onClick={openCreateModal}
                            className="mt-2 px-3 py-1.5 md:px-4 md:py-2 text-xs font-medium text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 rounded-md"
                          >
                            Tambah Pengguna Baru
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Tambah/Edit Pengguna */}
          {isModalOpen && (
            <dialog id="user_modal" className="modal modal-open">
              <div className="modal-box w-11/12 md:w-3/4 lg:w-1/2 max-w-3xl">
                <h3 className="font-bold text-lg md:text-xl mb-4">{editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</h3>
                
                {error && (
                  <div role="alert" className="alert alert-error text-sm mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{error}</span>
                  </div>
                )}
                
                <form onSubmit={handleCreateOrUpdateUser}>
                  <div className="form-control mb-3 md:mb-4">
                    <label className="label">
                      <span className="label-text text-sm md:text-base">Username</span>
                    </label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      className="input input-bordered w-full text-sm md:text-base h-10 md:h-12"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingUser} // Username cannot be changed when editing
                    />
                  </div>
                  <div className="form-control mb-3 md:mb-4">
                    <label className="label">
                      <span className="label-text text-sm md:text-base">Password {editingUser ? '(Kosongkan jika tidak diubah)' : ''}</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      className="input input-bordered w-full text-sm md:text-base h-10 md:h-12"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingUser} // Required for new user, optional for edit
                    />
                  </div>
                   <div className="form-control mb-3 md:mb-4">
                    <label className="label">
                      <span className="label-text text-sm md:text-base">Nama Lengkap</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nama Lengkap"
                      className="input input-bordered w-full text-sm md:text-base h-10 md:h-12"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-control mb-3 md:mb-4">
                    <label className="label">
                      <span className="label-text text-sm md:text-base">Peran</span>
                    </label>
                    <select
                      name="role"
                      className="select select-bordered w-full text-sm md:text-base h-10 md:h-12"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="pegawai">Pegawai</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="modal-action flex flex-col sm:flex-row-reverse sm:justify-start gap-2">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm md:btn-md w-full sm:w-auto" 
                      disabled={loading}
                    >
                      {loading ? <span className="loading loading-spinner"></span> : (editingUser ? 'Simpan Perubahan' : 'Buat Pengguna')}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-sm md:btn-md w-full sm:w-auto" 
                      onClick={closeModal}
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
              <form method="dialog" className="modal-backdrop">
                <button onClick={closeModal}>close</button>
              </form>
            </dialog>
          )}

        </main>
      </div>
    </div>
  );
};

export default UsersPage;