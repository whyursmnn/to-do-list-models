// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col shadow-sm">
      {/* Navigation Section */}
      <nav className="flex-grow px-4 py-6">
        <div className="text-2xl font-bold mb-6 text-center">
          Menu Utama
        </div>
        <ul className="space-y-1">
          <li>
            <Link 
              to="/" 
              className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700
                dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/tasks" 
              className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700
                dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
              </svg>
              Tugas
            </Link>
          </li>
          <li>
            <Link 
              to="/categories" 
              className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700
                dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
            >
              <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
              </svg>
              Kategori
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/users" 
                className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                  text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700
                  dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
                Pengguna
              </Link>
            </li>
          )}
        </ul>
        
        {/* Additional Menu Section */}
        <div className="mt-8">
          <div className="mb-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            Pengaturan
          </div>
          <ul className="space-y-1">
            <li>
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                  text-gray-700 dark:text-gray-200 hover:bg-blue-50 hover:text-blue-700
                  dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
              >
                <svg className="w-5 h-5 mr-3 text-gray-400 dark:text-gray-500 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                Profil
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      
      {/* Footer Section */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          Aplikasi To-Do Perusahaan
          <div className="mt-1 font-medium">© 2025</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;