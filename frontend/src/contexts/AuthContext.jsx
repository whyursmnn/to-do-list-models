// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, logoutUser, getUserInfoFromLocalStorage } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Cek token dan info user saat aplikasi dimuat
    const storedUser = getUserInfoFromLocalStorage();
    
    // --- PEMBARUAN: Tambahkan validasi lebih kuat untuk storedUser ---
    // Memastikan objek user ada dan memiliki properti kunci (misalnya id dan role)
    if (storedUser && storedUser.id && storedUser.role) { 
      setUser(storedUser);
      console.log("AuthContext: User data loaded from localStorage:", storedUser); // Untuk debugging
    } else {
      // Jika data user di localStorage tidak lengkap atau tidak valid,
      // bersihkan localStorage agar tidak ada data "setengah"
      console.log("AuthContext: No valid user data found in localStorage or data is incomplete.");
      localStorage.removeItem('token'); // Pastikan token juga dihapus
      localStorage.removeItem('user'); // Pastikan user juga dihapus
    }
    // --- AKHIR PEMBARUAN ---

    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    setIsLoading(true);
    try {
      const userData = await loginUser(username, password);
      setUser(userData);
      console.log("AuthContext: User logged in successfully. Setting user state:", userData); // Untuk debugging
      return true;
    } catch (error) {
      // Lebih spesifik log error dari AuthContext
      console.error("AuthContext: Login failed during processing:", error); 
      setUser(null);
      throw error; // Lempar error untuk ditangani di komponen UI (misal LoginPage)
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log("AuthContext: Attempting logout for user:", user?.username); // Untuk debugging
    await logoutUser(); // Panggil logout dari service (akan menghapus local storage)
    setUser(null);
    console.log("AuthContext: User state cleared, redirecting to login.");
    navigate('/login'); // Arahkan ke halaman login setelah logout
  };

  const isAdmin = user && user.role === 'admin';
  const isAuthenticated = !!user; // Pengguna dianggap terautentikasi jika objek user ada

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);