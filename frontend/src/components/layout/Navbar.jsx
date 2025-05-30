// frontend/src/components/layout/Navbar.jsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-md">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl normal-case">To-Do Perusahaan</Link>
      </div>
      <div className="flex-none gap-2">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">
              {/* Anda bisa menampilkan avatar atau inisial user di sini */}
              <img alt="User Avatar" src="https://daisyui.com/images/stock/photo-1534528736684-ce498b5da6ad.jpg" />
            </div>
          </div>
          <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
            <li><Link to="/profile">Profil</Link></li> {/* Buat halaman ini nanti */}
            {user?.role === 'admin' && <li><Link to="/users">Manajemen User</Link></li>}
            <li><button onClick={logout}>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;