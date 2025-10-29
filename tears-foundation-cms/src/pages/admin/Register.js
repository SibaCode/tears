// src/pages/admin/Register.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'admin' // First user should be admin
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date(),
        isFirstAdmin: true // Flag to identify the first admin
      });

      setSuccess(true);
      
      // Auto-login and redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Failed to create account. Please try again.');
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

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--secondary-gray-light) 100%)',
        padding: 'var(--spacing-8) var(--spacing-4)'
      }}>
        <div className="card" style={{maxWidth: '400px', width: '100%'}}>
          <div className="card-body text-center">
            <div className="alert alert-success">
              <h2>Registration Successful! 🎉</h2>
              <p>Your admin account has been created successfully.</p>
              <p>Redirecting to dashboard...</p>
              <div className="loading-spinner" style={{margin: 'var(--spacing-4) auto'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--secondary-gray-light) 100%)',
      padding: 'var(--spacing-8) var(--spacing-4)'
    }}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
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
            <h2 style={{marginBottom: 'var(--spacing-2)'}}>Create Admin Account</h2>
            <p style={{color: 'var(--secondary-gray)'}}>Set up your TEARS Foundation admin account</p>
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
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min. 6 characters)"
                required
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                className="form-input"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                minLength="6"
              />
            </div>

            <input
              type="hidden"
              name="role"
              value="admin"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="loading-spinner" style={{marginRight: 'var(--spacing-2)'}}></span>
                  Creating Account...
                </span>
              ) : (
                'Create Admin Account'
              )}
            </button>
            
            <div style={{textAlign: 'center', marginTop: 'var(--spacing-4)'}}>
              <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
                Already have an account?{' '}
                <Link to="/admin/login" style={{color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none'}}>
                  Sign in here
                </Link>
              </p>
            </div>
          </form>

          <div style={{marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--primary-blue-light)', borderRadius: 'var(--radius-lg)'}}>
            <p style={{fontSize: 'var(--font-size-sm)', textAlign: 'center', margin: 0}}>
              <strong>First Time Setup:</strong><br/>
              This will create the first administrator account for your TEARS Foundation system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;