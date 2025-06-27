// frontend/src/pages/NotFoundPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 relative overflow-hidden">
      {/* Background Patterns - Subtle circles for visual interest */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-blue-100 dark:bg-blue-900/20 opacity-70 dark:opacity-30"></div>
        <div className="absolute top-1/4 -right-10 w-72 h-72 rounded-full bg-purple-100 dark:bg-purple-900/20 opacity-70 dark:opacity-30"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 rounded-full bg-amber-100 dark:bg-amber-900/20 opacity-60 dark:opacity-20"></div>
      </div>
      
      {/* Main Content Container */}
      <div className="relative z-10 max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* 404 Image/Illustration */}
        <div className="flex justify-center my-8 relative">
          <svg className="w-32 h-32 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <div className="absolute top-29 text-center">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 text-transparent bg-clip-text">404</div>
          </div>
        </div>

        {/* Div spacer untuk memberikan jarak */}
        <div className="h-4"></div>
        
        {/* Error Content */}
        <div className="px-8 pb-10  text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Halaman Tidak Ditemukan</h1>

          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
          </p>
          
          <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Coba periksa URL dan pastikan alamat yang dimasukkan sudah benar.
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn btn-primary mt-8 text-white !text-white">Kembali ke Dashboard</Link>
          </div>
        </div>
      </div>
      
      {/* App Copyright */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        &copy; 2025 To-Do App Perusahaan
      </div>
    </div>
  );
};

export default NotFoundPage;