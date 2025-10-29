// src/pages/admin/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import tearsLogo from './logo.webp';

const Login = () => {
  const [email, setEmail] = useState('superadmin@tears.org');
  const [password, setPassword] = useState('SuperAdmin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password.');
      } else if (error.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.message.includes('not authorized')) {
        setError('User not authorized. Please contact administrator.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    }
    
    setLoading(false);
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
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body">
          <div style={{textAlign: 'center', marginBottom: 'var(--spacing-8)'}}>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--white)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-4)',
              border: '2px solid var(--primary-blue)',
              padding: 'var(--spacing-2)'
            }}>
              <img 
                src={tearsLogo} 
                alt="TEARS Foundation Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
            </div>
            <h2 style={{marginBottom: 'var(--spacing-2)'}}>TEARS Foundation</h2>
            <p style={{color: 'var(--secondary-gray)'}}>Staff Login</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)'}}>
            {error && (
              <div className="alert alert-error">
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <span style={{marginRight: 'var(--spacing-2)'}}>❌</span>
                  {error}
                </div>
              </div>
            )}
            
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? (
                <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <span className="loading-spinner" style={{marginRight: 'var(--spacing-2)'}}></span>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Disclaimer about pre-added test credentials */}
          <div style={{
            marginTop: 'var(--spacing-6)',
            padding: 'var(--spacing-4)',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: 'var(--radius-lg)'
          }}>
            <p style={{
              fontSize: 'var(--font-size-sm)',
              textAlign: 'center',
              margin: 0,
              color: '#856404',
              lineHeight: '1.5'
            }}>
              <strong>🛡️ Demo System Notice</strong><br/>
              Test credentials have been pre-configured for demonstration purposes.
              Use the credentials below to explore the system:
            </p>
            <div style={{
              marginTop: 'var(--spacing-2)',
              padding: 'var(--spacing-3)',
              backgroundColor: 'rgba(255,255,255,0.5)',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-size-xs)',
              textAlign: 'center'
            }}>
              <strong>Email:</strong> superadmin@tears.org<br/>
              <strong>Password:</strong> SuperAdmin123!
            </div>
          </div>

          {/* <div style={{textAlign: 'center', marginTop: 'var(--spacing-4)'}}>
            <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
              Having trouble accessing?{' '}
              <Link to="/admin/manual-setup" style={{color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none'}}>
                Use manual setup
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;