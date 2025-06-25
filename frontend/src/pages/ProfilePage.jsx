// frontend/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { updateUser } from '../services/userService';

const ProfilePage = () => {
  const { user, isLoading: authLoading, isAuthenticated, logout, refreshUser } = useAuth(); // Ambil refreshUser
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(''); // Inisialisasi kosong, diisi di useEffect
  const [editPassword, setEditPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Efek untuk mengisi data nama dan mereset status pesan saat user dimuat/berubah
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
    }
    // Bersihkan status sukses/error setiap kali komponen dimuat atau user berubah
    // Ini mencegah pesan sukses dari sesi sebelumnya muncul secara otomatis
    setUpdateSuccess(false); 
    setUpdateError(null);
  }, [user]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <h2 className="text-xl text-error">Silakan login untuk melihat profil Anda.</h2>
      </div>
    );
  }

  const handleEditClick = () => {
    console.log("Edit Profil button clicked. Entering edit mode.");
    setIsEditing(true);
    setEditPassword(''); // Bersihkan field password saat masuk mode edit
    setConfirmPassword('');
    setUpdateError(null); // Bersihkan error/sukses sebelumnya
    setUpdateSuccess(false);
  };

  const handleCancelClick = () => {
    console.log("Cancel button clicked. Exiting edit mode.");
    setIsEditing(false);
    setEditName(user?.name || ''); // Reset nama ke nilai asli dari user state
    setEditPassword('');
    setConfirmPassword('');
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault(); // SANGAT PENTING: Mencegah reload halaman saat form submit
    console.log("Submitting profile update.");
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false); // Reset pesan sukses sebelum submit form

    if (editPassword && editPassword !== confirmPassword) {
      setUpdateError('Password baru dan konfirmasi password tidak cocok.');
      setUpdateLoading(false);
      return;
    }

    try {
      const updatePayload = {
        name: editName,
      };

      if (editPassword) { // Hanya sertakan password jika diisi
        updatePayload.password = editPassword;
      }
      
      await updateUser(user.id, updatePayload); // Memanggil API untuk update

      // Jika password diubah, paksa logout agar user login ulang dengan password baru
      if (editPassword) {
        alert('Password berhasil diubah. Silakan login kembali dengan password baru Anda.');
        await logout(); // Memanggil logout dari AuthContext akan membersihkan token dan mengarahkan ke login
        return;
      }

      // Jika hanya nama yang diubah (tidak ada password baru)
      await refreshUser(); // Gunakan refreshUser untuk memuat ulang data user dari backend dan perbarui AuthContext

      setEditPassword(''); // Bersihkan field password setelah update
      setConfirmPassword(''); // Bersihkan field konfirmasi setelah update
      setUpdateSuccess(true); // Tampilkan pesan sukses
      setIsEditing(false); // Keluar dari mode edit
      
      alert('Profil berhasil diperbarui!'); // Feedback sukses

    } catch (err) {
      setUpdateError(err.detail ? (Array.isArray(err.detail) ? err.detail.map(d => d.msg).join(', ') : err.detail) : 'Gagal memperbarui profil.');
      console.error('Update profile error:', err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-base-200">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-4xl font-bold text-base-content mb-6">Profil Pengguna</h1>

          {/* Menampilkan pesan error atau sukses */}
          {updateError && (
            <div role="alert" className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{updateError}</span>
            </div>
          )}
          {updateSuccess && (
            <div role="alert" className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Profil berhasil diperbarui!</span>
            </div>
          )}

          <div className="card w-full max-w-lg bg-base-100 shadow-xl mx-auto">
            <div className="card-body">
              <h2 className="card-title text-base-content mb-4">Informasi Akun</h2>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="avatar placeholder">
                  <div className="bg-neutral text-neutral-content rounded-full w-20">
                    <span className="text-3xl">{user?.username ? user.username.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xl font-semibold text-base-content">{user?.name || user?.username}</p>
                  <p className="text-md text-gray-500">{user?.username} - {user?.role}</p>
                </div>
              </div>

              {/* Tampilan data profil saat tidak dalam mode edit */}
              {/* === PENTING: BAGIAN INI TIDAK LAGI DALAM <form> === */}
              {!isEditing ? (
                <> {/* Gunakan Fragment untuk membungkus */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label"><span className="label-text text-base-content">Username:</span></label>
                      <input type="text" value={user?.username || ''} className="input input-bordered w-full" readOnly />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-base-content">Nama Lengkap:</span></label>
                      <input type="text" value={user?.name || ''} className="input input-bordered w-full" readOnly />
                    </div>
                    <div className="form-control">
                      <label className="label"><span className="label-text text-base-content">Peran:</span></label>
                      <input type="text" value={user?.role || ''} className="input input-bordered w-full" readOnly />
                    </div>
                    {user?.email && (
                      <div className="form-control">
                        <label className="label"><span className="label-text text-base-content">Email:</span></label>
                        <input type="email" value={user?.email || ''} className="input input-bordered w-full" readOnly />
                      </div>
                    )}
                    <div className="form-control col-span-1 md:col-span-2">
                      <label className="label"><span className="label-text text-base-content">ID Pengguna:</span></label>
                      <input type="text" value={user?.id || ''} className="input input-bordered w-full" readOnly />
                    </div>
                  </div>
                  {/* Tombol "Edit Profil" (Hanya muncul jika TIDAK dalam mode edit) */}
                  <div className="card-actions justify-end mt-6">
                    <button type="button" onClick={handleEditClick} className="btn btn-primary">Edit Profil</button>
                  </div>
                </>
              ) : null} {/* Jika isEditing true, bagian ini tidak ditampilkan */}

              {/* Form EDIT Profil (Hanya muncul jika isEditing true) */}
              {isEditing && (
                <form onSubmit={handleUpdateProfile} className="card-body pt-0"> {/* pt-0 untuk menghilangkan padding atas yang tumpang tindih */}
                  <h2 className="card-title text-base-content mb-4">Ubah Informasi Akun</h2>
                  
                  {/* Field-field yang bisa diedit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text text-base-content">Nama Lengkap:</span>
                      </label>
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="input input-bordered w-full" 
                        required={true} // Nama wajib diisi saat mode edit
                      />
                    </div>
                    {/* Password Fields */}
                    <div className="form-control col-span-1 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-base-content">Password Baru:</span>
                      </label>
                      <input 
                        type="password" 
                        placeholder="Kosongkan jika tidak diubah"
                        value={editPassword} 
                        onChange={(e) => setEditPassword(e.target.value)} 
                        className="input input-bordered w-full" 
                      />
                    </div>
                    <div className="form-control col-span-1 md:col-span-2">
                      <label className="label">
                        <span className="label-text text-base-content">Konfirmasi Password Baru:</span>
                      </label>
                      <input 
                        type="password" 
                        placeholder="Ulangi password baru"
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="input input-bordered w-full" 
                      />
                    </div>
                  </div>

                  {/* Tombol Simpan/Batal */}
                  <div className="card-actions justify-end mt-6 col-span-full">
                    <button type="submit" className="btn btn-success" disabled={updateLoading}>
                      {updateLoading ? <span className="loading loading-spinner"></span> : "Simpan Perubahan"}
                    </button>
                    <button type="button" onClick={handleCancelClick} className="btn btn-ghost">Batal</button>
                  </div>
                </form>
              )} {/* Akhir conditional rendering form */}
            </div> {/* Akhir card-body untuk tampilan */}
          </div> {/* Akhir card */}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
