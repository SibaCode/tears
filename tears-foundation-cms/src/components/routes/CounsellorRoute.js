// src/components/routes/CounsellorRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CounsellorLayout from '../admin/CounsellorSidebar';

const CounsellorRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }
  
  if (userRole !== 'counsellor') {
    return <Navigate to="/admin/dashboard" />;
  }
  
  return <CounsellorLayout>{children}</CounsellorLayout>;
};

export default CounsellorRoute;