// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext'; // Akan dibuat nanti

// Import halaman-halaman Anda (akan dibuat nanti)
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage'; // Halaman Admin
import TasksPage from './pages/TasksPage';
import CategoriesPage from './pages/CategoriesPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';

// Import komponen untuk proteksi rute
import AuthRequired from './components/AuthRequired';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider> {/* Provider autentikasi global */}
        <Routes>
          {/* Rute Publik */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rute Terproteksi (Memerlukan Login) */}
          {/* User Admin dan Pegawai bisa mengakses rute ini */}
          <Route element={<AuthRequired allowedRoles={['admin', 'pegawai']} />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Tambahkan rute lain yang memerlukan login di sini */}
          </Route>

          {/* Rute Khusus Admin */}
          {/* Hanya Admin yang bisa mengakses rute di dalam AdminRoute */}
          <Route element={<AdminRoute />}>
            <Route path="/users" element={<UsersPage />} />
            {/* Rute lain khusus admin bisa ditambahkan di sini */}
          </Route>

          {/* Rute Catch-all untuk halaman tidak ditemukan */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;