// frontend/src/components/AdminRoute.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import AuthRequired from './AuthRequired'; 

const AdminRoute = () => {
  return (
    <AuthRequired allowedRoles={['admin']}>
      <Outlet />
    </AuthRequired>
  );
};

export default AdminRoute;