// src/components/admin/AdminSidebar.js - Proper layout component with super admin support
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userRole, logout, currentUser, userData } = useAuth();

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
    <div style={{display: 'flex'}}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: 'var(--primary-blue)',
        color: 'var(--white)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        padding: 'var(--spacing-6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{marginBottom: 'var(--spacing-8)'}}>
          <h2 style={{fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--spacing-1)'}}>
            TEARS Foundation
          </h2>
          <p style={{fontSize: 'var(--font-size-sm)', opacity: 0.8}}>Case Management</p>
        </div>

        {/* Navigation */}
        <nav style={{flex: 1}}>
          <ul style={{listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)'}}>
            <li>
              <Link 
                to="/admin/dashboard" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  color: 'var(--white)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isActive('/admin/dashboard') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                📊 Dashboard
              </Link>
            </li>
            
            <li>
              <Link 
                to="/admin/cases" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  color: 'var(--white)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isActive('/admin/cases') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                📋 Case Management
              </Link>
            </li>
            
            {/* Show User Management for both admin and super_admin roles */}
            {(userRole === 'admin' || userRole === 'super_admin') && (
              <li>
                <Link 
                  to="/admin/users" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    color: 'var(--white)',
                    textDecoration: 'none',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: isActive('/admin/users') ? 'rgba(255,255,255,0.2)' : 'transparent',
                    transition: 'background-color 0.2s'
                  }}
                >
                  👥 User Management
                </Link>
              </li>
            )}

            {/* Super Admin Only Features */}
            {userRole === 'super_admin' && (
              <>
                <li>
                  <Link 
                    to="/admin/system-settings" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--spacing-3) var(--spacing-4)',
                      color: 'var(--white)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isActive('/admin/system-settings') ? 'rgba(255,255,255,0.2)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    ⚙️ System Settings
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/audit-logs" 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: 'var(--spacing-3) var(--spacing-4)',
                      color: 'var(--white)',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: isActive('/admin/audit-logs') ? 'rgba(255,255,255,0.2)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    📝 Audit Logs
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link 
                to="/admin/reports" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-3) var(--spacing-4)',
                  color: 'var(--white)',
                  textDecoration: 'none',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: isActive('/admin/reports') ? 'rgba(255,255,255,0.2)' : 'transparent',
                  transition: 'background-color 0.2s'
                }}
              >
                📈 Reports & Analytics
              </Link>
            </li>
          </ul>
        </nav>

        {/* User Info & Logout */}
        <div style={{
          paddingTop: 'var(--spacing-4)',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          marginTop: 'var(--spacing-4)'
        }}>
          <div style={{padding: 'var(--spacing-3)', marginBottom: 'var(--spacing-2)'}}>
            <p style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-1)'}}>
              {userData?.name || currentUser?.email}
            </p>
            <p style={{
              fontSize: 'var(--font-size-xs)', 
              opacity: 0.8, 
              textTransform: 'capitalize',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-1)'
            }}>
              {userRole === 'super_admin' && '👑 '}
              {userRole}
            </p>
          </div>
          
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              textAlign: 'left',
              padding: 'var(--spacing-3) var(--spacing-4)',
              backgroundColor: 'transparent',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius-lg)',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            🚪 Logout
          </button>
          
          {/* <Link 
            to="/" 
            style={{
              display: 'block',
              padding: 'var(--spacing-3) var(--spacing-4)',
              color: 'var(--white)',
              textDecoration: 'none',
              borderRadius: 'var(--radius-lg)',
              transition: 'background-color 0.2s',
              marginTop: 'var(--spacing-1)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            🌐 Public Site
          </Link> */}
        </div>
      </div>

      {/* Main content */}
      <div style={{
        marginLeft: '250px',
        flex: 1,
        minHeight: '100vh',
        backgroundColor: 'var(--secondary-gray-light)',
        padding: 'var(--spacing-6)'
      }}>
        {children}
      </div>
    </div>
  );
};

export default AdminSidebar;