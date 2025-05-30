// frontend/src/components/AuthRequired.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './common/LoadingSpinner'; 

const AuthRequired = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    // Jika tidak terautentikasi, arahkan ke halaman login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Jika terautentikasi tetapi tidak memiliki peran yang diizinkan, arahkan ke halaman unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Jika terautentikasi dan memiliki peran yang diizinkan, render child routes
  return <Outlet />;
};

export default AuthRequired;