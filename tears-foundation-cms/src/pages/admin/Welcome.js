// src/pages/admin/Welcome.js
import React from 'react';
import { Link } from 'react-router-dom';
import tearsLogo from './logo.webp';

const Welcome = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-blue-dark) 100%)',
      padding: 'var(--spacing-8) var(--spacing-4)',
      color: 'var(--white)',
      textAlign: 'center'
    }}>
      <div style={{maxWidth: '500px'}}>
        {/* Logo at the top */}
        <div style={{
          width: '120px',
          height: '120px',
          backgroundColor: 'var(--white)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-6)',
          padding: 'var(--spacing-3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
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
        
        <h1 style={{fontSize: 'var(--font-size-4xl)', fontWeight: '700', marginBottom: 'var(--spacing-4)'}}>
          Welcome to TEARS Foundation
        </h1>
        
        <p style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-8)', opacity: 0.9}}>
          Case Management System
        </p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', alignItems: 'center'}}>
          <Link 
            to="/admin/login" 
            className="btn btn-primary"
            style={{
              fontSize: 'var(--font-size-lg)',
              padding: 'var(--spacing-4) var(--spacing-8)',
              backgroundColor: 'var(--white)',
              color: 'var(--primary-blue)',
              textDecoration: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Login
          </Link>
          
        </div>
      </div>
    </div>
  );
};

export default Welcome;