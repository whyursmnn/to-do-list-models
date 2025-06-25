// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, logoutUser, getUserInfoFromLocalStorage, getMe } from '../services/authService';
import { useNavigate } from 'react-router-dom';
// import api from '../utils/api'; // Tidak perlu import api di sini jika getMe sudah menggunakannya

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Status loading untuk seluruh AuthContext
  const navigate = useNavigate();

  // === DIPERBAIKI: Pindahkan deklarasi refreshUser ke sini ===
  // Fungsi untuk memuat ulang data user dari backend dan memvalidasi token
  const refreshUser = async () => {
    try {
      const response = await getMe(); // Memanggil endpoint /api/auth/me melalui authService
      
      if (response && response.id && response.role) { // Pastikan respons getMe() valid
        localStorage.setItem('user', JSON.stringify(response)); // Simpan data user terbaru
        setUser(response); // Perbarui state user
        console.log("AuthContext: User data refreshed and validated from backend:", response);
        return response;
      } else {
        // Jika getMe() mengembalikan null (token tidak valid/kadaluarsa dari sisi backend)
        console.warn('AuthContext: Stored token is invalid or expired after refresh. Clearing session.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null); // Set user ke null karena sesi tidak valid
        return null; // Mengembalikan null untuk menandakan kegagalan validasi
      }
    } catch (err) {
      // Tangani error lain dari getMe() (misal, network error, 500 dari backend)
      console.error('AuthContext: Error during user refresh/validation:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      throw err; // Lempar error untuk ditangani oleh pemanggil jika perlu
    }
  };
  // === AKHIR PERBAIKAN refreshUser ===

  // Fungsi yang dijalankan saat komponen dimount pertama kali
  const handleInitialLoad = async () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = getUserInfoFromLocalStorage();

    if (storedToken && storedUser && storedUser.id && storedUser.role) {
      setUser(storedUser); // Set user sementara dari localStorage untuk menghindari isLoading lama
      console.log('AuthContext: Stored user data found. Attempting to refresh/validate session with backend.');

      try {
        // Coba panggil refreshUser() untuk memvalidasi token dari backend
        // refreshUser() sekarang sudah dideklarasikan di atas dan mengembalikan null jika 401/403
        await refreshUser(); 
      } catch (error) {
        // refreshUser akan menangani pembersihan storage dan setUser(null)
        console.error('AuthContext: Initial refresh/validation failed. User likely needs to re-login.', error);
      }
    } else {
      console.log('AuthContext: No valid token or complete user data found. Ensuring storage is clean.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
    setIsLoading(false); // Selesai memuat status autentikasi awal
  };

  useEffect(() => {
    handleInitialLoad();
  }, []); // Hanya jalankan sekali saat komponen dimount

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(username, password);
      setUser(userData);
      console.log("AuthContext: User logged in successfully. Setting user state:", userData);
      return true;
    } catch (error) {
      console.error("AuthContext: Login failed during processing:", error);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout for user:", user?.username);
    await logoutUser();
    setUser(null);
    console.log("AuthContext: User state cleared, redirecting to login.");
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isAdmin,
      login,
      logout,
      isLoading,
      refreshUser // Ini diekspor agar komponen lain bisa memicu refresh data user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
