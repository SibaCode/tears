// src/pages/admin/Setup.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';

const Setup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const createFirstAdmin = async () => {
    setLoading(true);
    setError('');

    try {
      // Try to create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        'admin@tearsfoundation.org',
        'Admin123!' // Change this password!
      );

      const user = userCredential.user;

      // Try to create user document
      await setDoc(doc(db, 'users', user.uid), {
        name: 'System Administrator',
        email: 'admin@tearsfoundation.org',
        role: 'admin',
        isActive: true,
        createdAt: new Date()
      });

      alert('First admin created successfully! You can now login.');
      navigate('/admin/login');

    } catch (error) {
      console.error('Setup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Admin user already exists. Try logging in instead.');
      } else if (error.code === 'auth/operation-not-allowed') {
        setError('Email/password accounts are not enabled. Check Firebase Auth settings.');
      } else {
        setError(`Setup failed: ${error.message}. You may need to set up Firebase security rules first.`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-8)'
    }}>
      <div className="card" style={{maxWidth: '500px', width: '100%'}}>
        <div className="card-body text-center">
          <h1 style={{marginBottom: 'var(--spacing-4)'}}>First-Time Setup</h1>
          
          {error && (
            <div className="alert alert-error" style={{marginBottom: 'var(--spacing-4)'}}>
              {error}
            </div>
          )}

          <div className="alert alert-info" style={{marginBottom: 'var(--spacing-4)', textAlign: 'left'}}>
            <h3>Before You Begin:</h3>
            <ol style={{paddingLeft: 'var(--spacing-4)', marginTop: 'var(--spacing-2)'}}>
              <li>Make sure Firebase Authentication is enabled with Email/Password provider</li>
              <li>Firestore security rules should allow writes to the 'users' collection</li>
              <li>This will create the first admin account</li>
            </ol>
          </div>

          <button
            onClick={createFirstAdmin}
            disabled={loading}
            className="btn btn-primary"
            style={{marginBottom: 'var(--spacing-4)'}}
          >
            {loading ? 'Creating Admin Account...' : 'Create First Admin Account'}
          </button>

          <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
            Default credentials: admin@tearsfoundation.org / Admin123!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Setup;