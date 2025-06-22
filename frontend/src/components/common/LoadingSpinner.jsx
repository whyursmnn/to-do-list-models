// frontend/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative">

      {/* Loading Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-sm w-full mx-4 flex flex-col items-center border border-gray-200 dark:border-gray-700">
        {/* App Logo */}
        <div className="mb-6">
          <div className="bg-blue-600 dark:bg-blue-500 p-3 rounded-xl">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
        </div>
        
        {/* Modern Multi-Layer Spinner */}
        <div className="relative h-20 w-20 mb-6">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-blue-900/30"></div>
          
          {/* Spinning Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 dark:border-t-blue-400 animate-spin"></div>
          
          {/* Inner Spinning Ring (opposite direction) */}
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-blue-500 dark:border-b-blue-400 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          
          {/* Pulsating Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-4 w-4 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading Message */}
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">
          Memuat Data
        </h3>
        <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-3">
          Mohon tunggu sebentar sementara kami mempersiapkan aplikasi Anda.
        </p>
        
        {/* Animated Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-400 dark:to-purple-400 h-1.5 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
        
        {/* Loading Status */}
        <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Mengambil data tugas dan pengguna
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        &copy; 2025 To-Do App Perusahaan
      </div>
    </div>
  );
};

export default LoadingSpinner;

