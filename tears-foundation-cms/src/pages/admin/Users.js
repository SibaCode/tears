// src/pages/admin/Users.js
import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import Register from '../admin/Register';
import EditCounsellor from '../admin/EditCounsellor';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [showRegister, setShowRegister] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { userRole } = useAuth();

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

// In your Users.js component
const handleRegistrationSuccess = () => {
  setShowRegister(false);
  // This will trigger the useEffect to reload users
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
};
  const handleEditSuccess = () => {
    setEditingUser(null);
    alert('User updated successfully!');
  };

  // Filter users based on role and active status
  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    if (filter === 'counsellors') return user.role === 'counsellor';
    if (filter === 'admins') return user.role === 'admin' || user.role === 'superadmin';
    if (filter === 'superadmins') return user.role === 'superadmin';
    if (filter === 'active') return user.isActive === true;
    if (filter === 'inactive') return user.isActive === false;
    return true;
  });

  // Allow both admin and superadmin to access this page
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return (
      <div style={{padding: 'var(--spacing-8)'}}>
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          textAlign: 'center',
          padding: 'var(--spacing-12)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--secondary-gray-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--spacing-6)',
            fontSize: 'var(--font-size-2xl)'
          }}>
            ⚠️
          </div>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: 'var(--spacing-3)'
          }}>
            Access Restricted
          </h2>
          <p style={{
            color: 'var(--text-gray)',
            lineHeight: '1.6',
            marginBottom: 'var(--spacing-4)'
          }}>
            You don't have the required permissions to access this section.
          </p>
          <div style={{
            padding: 'var(--spacing-3)',
            backgroundColor: 'var(--secondary-gray-light)',
            borderRadius: 'var(--radius)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--text-gray)'
          }}>
            Current role: <strong>{userRole}</strong> • Required: <strong>Admin or Super Admin</strong>
          </div>
        </div>
      </div>
    );
  }

  const isSuperAdmin = userRole === 'superadmin';

  const getRoleConfig = (role) => {
    const config = {
      superadmin: { color: '#d35400', bgColor: '#fef5e7', label: 'Super Admin' },
      admin: { color: '#8e44ad', bgColor: '#f8f5ff', label: 'Admin' },
      counsellor: { color: '#2980b9', bgColor: '#f0f8ff', label: 'Counsellor' },
      user: { color: '#27ae60', bgColor: '#f0fff4', label: 'User' }
    };
    return config[role] || config.user;
  };

  if (showRegister || editingUser) {
    return (
      <div style={{padding: 'var(--spacing-6)'}}>
        {showRegister ? (
          <Register 
            onSuccess={handleRegistrationSuccess}
            onCancel={() => setShowRegister(false)}
          />
        ) : (
          <EditCounsellor 
            user={editingUser}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingUser(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-8)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: 'var(--spacing-2)'
          }}>
            User Management
          </h1>
          <p style={{
            color: 'var(--text-gray)',
            fontSize: 'var(--font-size-base)',
            margin: 0
          }}>
            Manage system users and their permissions
          </p>
        </div>
        
        <button 
          style={{
            padding: 'var(--spacing-3) var(--spacing-5)',
            backgroundColor: 'var(--primary-blue)',
            color: 'var(--white)',
            border: 'none',
            borderRadius: 'var(--radius)',
            fontWeight: '500',
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-blue-dark)'}
          onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-blue)'}
          onClick={() => setShowRegister(true)}
        >
          Add User
        </button>
      </div>

      {/* Stats and Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-4)',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            Total Users
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: 'var(--text-dark)'}}>
            {users.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            Active Users
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: 'var(--success-green)'}}>
            {users.filter(u => u.isActive).length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            Counsellors
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: 'var(--primary-blue)'}}>
            {users.filter(u => u.role === 'counsellor').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'var(--white)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-gray)',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-4)',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontWeight: '500',
            color: 'var(--text-dark)',
            fontSize: 'var(--font-size-sm)'
          }}>Filter:</span>
          
          <select 
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              border: '1px solid var(--border-gray)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--white)',
              fontSize: 'var(--font-size-sm)',
              minWidth: '140px'
            }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Users</option>
            <option value="counsellors">Counsellors</option>
            <option value="admins">Admins</option>
            {isSuperAdmin && <option value="superadmins">Super Admins</option>}
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <span style={{
            color: 'var(--text-light)',
            fontSize: 'var(--font-size-sm)',
            marginLeft: 'auto'
          }}>
            {filteredUsers.length} users
          </span>
        </div>
      </div>

      {/* Users Table */}
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-gray)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border-gray)',
          backgroundColor: 'var(--secondary-gray-light)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
            gap: 'var(--spacing-4)',
            alignItems: 'center'
          }}>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>User</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Contact</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Role</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Status</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              padding: 'var(--spacing-12)',
              textAlign: 'center',
              color: 'var(--text-light)'
            }}>
              <div style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)'}}>👥</div>
              <div style={{fontSize: 'var(--font-size-base)', fontWeight: '500', marginBottom: 'var(--spacing-2)'}}>
                No users found
              </div>
              <div style={{fontSize: 'var(--font-size-sm)'}}>
                {users.length === 0 ? 'Get started by adding your first user' : 'Try adjusting your filters'}
              </div>
            </div>
          ) : (
            filteredUsers.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              
              return (
                <div key={user.id} style={{
                  padding: 'var(--spacing-4)',
                  borderBottom: '1px solid var(--border-gray)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--secondary-gray-light)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--white)'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 2fr 1fr 1fr 1fr',
                    gap: 'var(--spacing-4)',
                    alignItems: 'center'
                  }}>
                    {/* User Info */}
                    <div>
                      <div style={{
                        fontWeight: '500',
                        color: 'var(--text-dark)',
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {user.name || 'Unnamed User'}
                      </div>
                      {user.role === 'counsellor' && user.maxCases && (
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-light)'
                        }}>
                          Max cases: {user.maxCases}
                        </div>
                      )}
                    </div>

                    {/* Contact */}
                    <div>
                      <div style={{
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--text-dark)',
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {user.email}
                      </div>
                      {user.role === 'counsellor' && user.specialization && (
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-light)'
                        }}>
                          {Array.isArray(user.specialization) ? user.specialization.join(', ') : user.specialization}
                        </div>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: roleConfig.bgColor,
                        color: roleConfig.color,
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        border: `1px solid ${roleConfig.color}20`
                      }}>
                        {roleConfig.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: user.isActive ? '#f0fff4' : '#f8f9fa',
                        color: user.isActive ? '#27ae60' : '#95a5a6',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        border: `1px solid ${user.isActive ? '#27ae60' : '#95a5a6'}20`
                      }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
                      <button
                        style={{
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          backgroundColor: 'transparent',
                          color: 'var(--primary-blue)',
                          border: '1px solid var(--primary-blue)',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-blue)';
                          e.target.style.color = 'var(--white)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--primary-blue)';
                        }}
                        onClick={() => setEditingUser(user)}
                        disabled={user.role === 'superadmin' && !isSuperAdmin}
                      >
                        Edit
                      </button>
                      
                      <button
                        style={{
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          backgroundColor: 'transparent',
                          color: 'var(--error-red)',
                          border: '1px solid var(--error-red)',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'var(--error-red)';
                          e.target.style.color = 'var(--white)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--error-red)';
                        }}
                        onClick={() => handleDeleteUser(user.id, user.email)}
                        disabled={loading || user.role === 'superadmin'}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer Info */}
      {isSuperAdmin && (
        <div style={{
          marginTop: 'var(--spacing-4)',
          padding: 'var(--spacing-3)',
          backgroundColor: '#fef5e7',
          border: '1px solid #f39c12',
          borderRadius: 'var(--radius)',
          fontSize: 'var(--font-size-sm)',
          color: '#d35400',
          textAlign: 'center'
        }}>
          ⚡ You are viewing this page with <strong>Super Admin</strong> privileges
        </div>
      )}
    </div>
  );
};

export default Users;