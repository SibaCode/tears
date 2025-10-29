// src/components/routes/StaffRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../admin/AdminSidebar';
import CounsellorLayout from '../admin/CounsellorSidebar';

const StaffRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }
  
  if (!['superadmin', 'admin', 'counsellor'].includes(userRole)) {
    return <Navigate to="/" />;
  }
  
  if (userRole === 'counsellor') {
    return <CounsellorLayout>{children}</CounsellorLayout>;
  } else {
    return <AdminLayout>{children}</AdminLayout>;
  }
};

export default StaffRoute;