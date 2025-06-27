// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <div className="w-64 min-h-screen bg-base-300 text-base-content flex flex-col p-4 shadow-lg">
      <div className="text-2xl font-bold mb-6 text-center">Menu</div>
      <ul className="menu p-4">
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/tasks">Tugas</Link></li>
        <li><Link to="/categories">Kategori</Link></li>
        {user?.role === 'admin' && (
          <li><Link to="/users">Pengguna</Link></li>
        )}
        {/* Tambahkan item menu lain di sini */}
      </ul>
      <div className="mt-auto p-4 text-sm text-center">
        Aplikasi To-Do Perusahaan © 2025
      </div>
    </div>
  );
};

export default Sidebar;