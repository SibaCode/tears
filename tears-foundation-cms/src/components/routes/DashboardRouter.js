// src/components/routes/DashboardRouter.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Dashboard from '../../pages/admin/Dashboard';
import CounsellorDashboard from '../../pages/admin/CounsellorDashboard';

const DashboardRouter = () => {
  const { userRole } = useAuth();
  return userRole === 'counsellor' ? <CounsellorDashboard /> : <Dashboard />;
};

export default DashboardRouter;