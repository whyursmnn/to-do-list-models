// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = ({ openSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-white dark:bg-gray-800 shadow-md px-4 py-2 flex items-center justify-between">
      <div className="flex-1 flex items-center">
        {/* Hamburger Menu Button - only visible on mobile/tablet */}
        <button 
          onClick={openSidebar}
          className="lg:hidden mr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
        <Link to="/" className="text-xl font-semibold text-gray-900 dark:text-white">To-Do Perusahaan</Link>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* User Profile Dropdown */}
        <div className="relative">
          {/* User Avatar - This is exactly your code */}
          <div 
            className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center text-white text-base font-medium shadow-sm cursor-pointer"
            onClick={() => document.getElementById('user-dropdown').classList.toggle('hidden')}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          
          {/* Dropdown Menu */}
          <div 
            id="user-dropdown"
            className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-50"
          >
            {/* User Info */}
            <div className="px-4 py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user?.name || user?.username}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.username}
                </p>
                {user?.role && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role.toLowerCase() === 'admin' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role.toLowerCase() === 'moderator'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {user?.role}
                  </span>
                )}
              </div>
            </div>
            
            {/* Menu Items */}
            <div className="py-1">
              <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                <svg className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profil
              </Link>
              
              {user?.role === 'admin' && (
                <Link to="/users" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <svg className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                  </svg>
                  Manajemen User
                </Link>
              )}
            </div>
            
            {/* Logout Option */}
            <div className="py-1">
              <button 
                onClick={logout} 
                className="flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg className="mr-3 h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Click outside detector */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('user-dropdown');
            const userAvatar = event.target.closest('.h-9.w-9.rounded-full');
            
            if (dropdown && !dropdown.contains(event.target) && !userAvatar) {
              dropdown.classList.add('hidden');
            }
          });
        `
      }} />
    </div>
  );
};

export default Navbar;