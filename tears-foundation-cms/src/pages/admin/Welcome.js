// src/pages/admin/Welcome.js
import React from 'react';
import { Link } from 'react-router-dom';

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
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: 'var(--white)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--spacing-6)'
        }}>
          <span style={{fontSize: 'var(--font-size-3xl)', color: 'var(--primary-blue)'}}>💙</span>
        </div>
        
        <h1 style={{fontSize: 'var(--font-size-4xl)', fontWeight: '700', marginBottom: 'var(--spacing-4)'}}>
          Welcome to TEARS Foundation
        </h1>
        
        <p style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-8)', opacity: 0.9}}>
          Case Management System Setup
        </p>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', alignItems: 'center'}}>
          <Link 
            to="/admin/register" 
            className="btn btn-primary"
            style={{
              fontSize: 'var(--font-size-lg)',
              padding: 'var(--spacing-4) var(--spacing-8)',
              backgroundColor: 'var(--white)',
              color: 'var(--primary-blue)'
            }}
          >
            Create First Admin Account
          </Link>
          
          <Link 
            to="/admin/login" 
            style={{
              color: 'var(--white)',
              textDecoration: 'none',
              fontWeight: '500'
            }}
          >
            Already have an account? Sign in
          </Link>
        </div>
        
        <div style={{
          marginTop: 'var(--spacing-8)',
          padding: 'var(--spacing-4)',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 'var(--radius-lg)'
        }}>
          <p style={{fontSize: 'var(--font-size-sm)', margin: 0}}>
            <strong>First Time Setup:</strong> Create your administrator account to start managing cases and team members.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;