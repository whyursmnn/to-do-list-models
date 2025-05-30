// frontend/src/utils/api.js
import axios from 'axios';

// Ambil URL API dari environment variable (Vite menggunakan import.meta.env)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token JWT ke setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ambil token dari local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani error respons
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Contoh: Jika token kadaluarsa atau tidak valid, arahkan ke halaman login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Hanya jika error bukan dari endpoint login itu sendiri
      if (!error.config.url.includes('/auth/token')) {
        console.error('Unauthorized or Forbidden access. Redirecting to login.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login'; // Arahkan ke halaman login
      }
    }
    return Promise.reject(error);
  }
);

export default api;