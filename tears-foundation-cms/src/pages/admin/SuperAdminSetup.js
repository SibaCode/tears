// src/pages/admin/SuperAdminSetup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const SuperAdminSetup = () => {
  const [formData, setFormData] = useState({
    name: 'Super Administrator',
    email: 'superadmin@tears.org',
    password: 'SuperAdmin123!',
    confirmPassword: 'SuperAdmin123!'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        formData.email, 
        formData.password
      );
      
      const user = userCredential.user;

      // Create super admin document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'admin',
        isActive: true,
        isSuperAdmin: true,
        createdAt: new Date()
      });

      alert('Super Admin created successfully! You can now login.');
      navigate('/admin/login');

    } catch (error) {
      console.error('Super Admin creation error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use. Try a different email.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Use Method 1 above.');
      } else {
        setError(`Creation failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--secondary-gray-light) 100%)',
      padding: 'var(--spacing-8) var(--spacing-4)'
    }}>
      <div className="card" style={{maxWidth: '500px', width: '100%'}}>
        <div className="card-body">
          <div style={{textAlign: 'center', marginBottom: 'var(--spacing-8)'}}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--primary-blue)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-4)'
            }}>
              <span style={{fontSize: 'var(--font-size-2xl)', color: 'var(--white)'}}>👑</span>
            </div>
            <h2 style={{marginBottom: 'var(--spacing-2)'}}>Create Super Admin</h2>
            <p style={{color: 'var(--secondary-gray)'}}>System Administrator Account</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
            {error && (
              <div className="alert alert-error">
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: 'var(--spacing-2)'}}>❌</span>
                  {error}
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating Super Admin...' : 'Create Super Admin Account'}
            </button>
          </form>

          <div style={{marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--primary-blue-light)', borderRadius: 'var(--radius-lg)'}}>
            <p style={{fontSize: 'var(--font-size-sm)', textAlign: 'center', margin: 0}}>
              <strong>Default Credentials:</strong><br/>
              Email: superadmin@tears.org<br/>
              Password: SuperAdmin123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSetup;