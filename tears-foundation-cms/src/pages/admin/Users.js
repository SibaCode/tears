// src/pages/admin/Users.js
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Users = () => {
  const { userRole } = useAuth();

  // Only allow admins to access this page
  if (userRole !== 'admin') {
    return (
      <div style={{padding: 'var(--spacing-8) 0'}}>
        <div className="container">
          <div className="alert alert-error">
            <h3>Access Denied</h3>
            <p>You do not have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: 'var(--spacing-8) 0'}}>
      <div className="container">
        <h1 style={{marginBottom: 'var(--spacing-6)'}}>User Management</h1>
        
        <div className="card">
          <div className="card-body">
            <div className="alert alert-info">
              <h3>User Management</h3>
              <p>User management features will be implemented here.</p>
              <p>Admins can create, edit, and manage staff accounts.</p>
            </div>
            
            <div style={{display: 'flex', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)'}}>
              <button className="btn btn-primary">Add New User</button>
              <button className="btn btn-secondary">View All Users</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;