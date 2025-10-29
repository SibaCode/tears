// src/pages/admin/Users.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc , getDocs} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import Register from '../admin/Register'; // Fixed import path
import EditCounsellor from '../admin/EditCounsellor'; // Fixed import path

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { userRole } = useAuth();

// In src/pages/admin/Users.js - Replace the useEffect with:
useEffect(() => {
  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  loadUsers();
}, []);

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user status');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone.`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegister(false);
    alert('User created successfully!');
  };

  const handleEditSuccess = () => {
    setEditingUser(null);
    alert('User updated successfully!');
  };

  // Filter users based on role and active status
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'counsellors') return user.role === 'counsellor';
    if (filter === 'admins') return user.role === 'admin';
    if (filter === 'active') return user.isActive === true;
    if (filter === 'inactive') return user.isActive === false;
    return true;
  });

  // Only allow admins to access this page - FIXED VERSION
  if (userRole !== 'admin') {
    return (
      <div style={{padding: 'var(--spacing-8) 0'}}>
        <div className="container">
          <div className="alert alert-error">
            <h3>Access Denied</h3>
            <p>You do not have permission to access this page.</p>
            <p>Your role: {userRole || 'Not logged in'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: 'var(--spacing-8) 0'}}>
      <div className="container">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)'}}>
          <h1>User Management</h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowRegister(true)}
          >
            + Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="card" style={{marginBottom: 'var(--spacing-6)'}}>
          <div className="card-body">
            <div style={{display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center', flexWrap: 'wrap'}}>
              <span style={{fontWeight: '600'}}>Filter:</span>
              <select 
                className="form-select"
                style={{width: 'auto'}}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="counsellors">Counsellors Only</option>
                <option value="admins">Admins Only</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
              </select>
              <span style={{color: 'var(--secondary-gray)'}}>
                Showing {filteredUsers.length} of {users.length} users
              </span>
            </div>
          </div>
        </div>

        {showRegister ? (
          <Register 
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegister(false)}
          />
        ) : editingUser ? (
          <EditCounsellor 
            user={editingUser}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingUser(null)}
          />
        ) : (
          <div className="card">
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header-cell">Name</th>
                      <th className="table-header-cell">Email</th>
                      <th className="table-header-cell">Role</th>
                      <th className="table-header-cell">Specialization</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="table-cell">
                          <div>
                            <strong>{user.name}</strong>
                            {user.role === 'counsellor' && user.maxCases && (
                              <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
                                Max Cases: {user.maxCases}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">{user.email}</td>
                        <td className="table-cell">
                          <span className={`badge ${user.role === 'admin' ? 'badge-high' : 'badge-medium'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="table-cell">
                          {user.role === 'counsellor' ? (
                            user.specialization && user.specialization.length > 0 ? (
                              <div style={{fontSize: 'var(--font-size-sm)'}}>
                                {Array.isArray(user.specialization) 
                                  ? user.specialization.join(', ') 
                                  : user.specialization
                                }
                              </div>
                            ) : (
                              <span style={{color: 'var(--secondary-gray)', fontStyle: 'italic'}}>No specialization</span>
                            )
                          ) : (
                            <span style={{color: 'var(--secondary-gray)'}}>-</span>
                          )}
                        </td>
                        <td className="table-cell">
                          <span className={`badge ${user.isActive ? 'badge-closed' : 'badge-in-progress'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="table-cell">
                          <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
                            <button
                              className="btn btn-secondary"
                              style={{padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)'}}
                              onClick={() => setEditingUser(user)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-secondary"
                              style={{padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)'}}
                              onClick={() => handleToggleActive(user.id, user.isActive)}
                              disabled={loading}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)'}}
                              onClick={() => handleDeleteUser(user.id, user.email)}
                              disabled={loading}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="table-cell text-center">
                          No users found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;