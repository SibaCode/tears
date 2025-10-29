// src/pages/admin/Login.js
import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Login functionality coming soon!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--secondary-gray-light) 100%)',
      padding: 'var(--spacing-8)'
    }}>
      <div className="card" style={{maxWidth: '400px', width: '100%'}}>
        <div className="card-body">
          <div style={{textAlign: 'center', marginBottom: 'var(--spacing-8)'}}>
            <h2>Admin Login</h2>
            <p style={{color: 'var(--secondary-gray)'}}>Case Management System</p>
          </div>
          
          <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)'}}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
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
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;