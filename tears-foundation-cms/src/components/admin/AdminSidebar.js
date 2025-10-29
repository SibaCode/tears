// src/components/admin/AdminSidebar.js
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="bg-blue-800 text-white w-64 min-h-screen fixed left-0 top-0 p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">TEARS Foundation</h1>
        <p className="text-blue-200 text-sm">Case Management System</p>
      </div>

      <nav className="space-y-2">
        <Link 
          to="/admin/dashboard" 
          className={`block p-3 rounded-lg transition ${
            isActive('/admin/dashboard') ? 'bg-blue-700' : 'hover:bg-blue-700'
          }`}
        >
          📊 Dashboard
        </Link>
        
        <Link 
          to="/admin/cases" 
          className={`block p-3 rounded-lg transition ${
            isActive('/admin/cases') ? 'bg-blue-700' : 'hover:bg-blue-700'
          }`}
        >
          📋 Case Management
        </Link>

        {userRole === 'admin' && (
          <Link 
            to="/admin/users" 
            className={`block p-3 rounded-lg transition ${
              isActive('/admin/users') ? 'bg-blue-700' : 'hover:bg-blue-700'
            }`}
          >
            👥 User Management
          </Link>
        )}

        <div className="pt-4 border-t border-blue-700 mt-4">
          <div className="p-3 text-sm">
            <p className="font-semibold">{currentUser?.email}</p>
            <p className="text-blue-200 capitalize">{userRole}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full text-left p-3 rounded-lg hover:bg-blue-700 transition"
          >
            🚪 Logout
          </button>
          
          <Link 
            to="/" 
            className="block p-3 rounded-lg hover:bg-blue-700 transition mt-2"
          >
            🌐 Public Site
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;