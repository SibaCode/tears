// src/components/routes/AdminRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../admin/AdminSidebar';

const AdminRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }
  
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <Navigate to="/" />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

export default AdminRoute;