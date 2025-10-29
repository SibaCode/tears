// src/pages/admin/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--primary-blue)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-4)'
            }}>
              <span style={{fontSize: 'var(--font-size-2xl)', color: 'var(--white)'}}>💙</span>
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
            
            <div style={{textAlign: 'center'}}>
              <Link to="/" style={{color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none'}}>
                ← Back to main site
              </Link>
            </div>
          </form>

          <div style={{marginTop: 'var(--spacing-6)', padding: 'var(--spacing-4)', backgroundColor: 'var(--primary-blue-light)', borderRadius: 'var(--radius-lg)'}}>
            <p style={{fontSize: 'var(--font-size-sm)', textAlign: 'center', margin: 0}}>
              <strong>Demo Access:</strong><br/>
              Contact administrator for login credentials
            </p>
          </div>
          <div style={{textAlign: 'center', marginTop: 'var(--spacing-4)'}}>
            <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
              Need to create the first admin account?{' '}
              <Link to="/admin/register" style={{color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none'}}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;