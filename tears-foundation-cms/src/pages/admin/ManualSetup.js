// src/pages/admin/ManualSetup.js
import React, { useState } from 'react';

const ManualSetup = () => {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--spacing-8)'
    }}>
      <div className="card" style={{maxWidth: '600px', width: '100%'}}>
        <div className="card-body">
          <h1 style={{textAlign: 'center', marginBottom: 'var(--spacing-6)'}}>Manual Setup Required</h1>
          
          <div className="alert alert-warning">
            <p>Automatic registration is not working. You need to manually set up the first admin user in Firebase Console.</p>
          </div>

          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="btn btn-primary"
            style={{marginBottom: 'var(--spacing-4)'}}
          >
            {showInstructions ? 'Hide Instructions' : 'Show Setup Instructions'}
          </button>

          {showInstructions && (
            <div style={{padding: 'var(--spacing-4)', backgroundColor: 'var(--secondary-gray-light)', borderRadius: 'var(--radius-lg)'}}>
              <h3>Step-by-Step Manual Setup:</h3>
              
              <div style={{marginBottom: 'var(--spacing-4)'}}>
                <h4>1. Enable Firebase Authentication</h4>
                <ul>
                  <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
                  <li>Select your project: <strong>tearsfoundation-df360</strong></li>
                  <li>Click "Authentication" in left sidebar</li>
                  <li>Click "Get Started"</li>
                  <li>Go to "Sign-in method" tab</li>
                  <li>Enable "Email/Password" provider</li>
                </ul>
              </div>

              <div style={{marginBottom: 'var(--spacing-4)'}}>
                <h4>2. Create Admin User Manually</h4>
                <ul>
                  <li>In Authentication → Users tab</li>
                  <li>Click "Add User"</li>
                  <li>Email: <code>admin@tearsfoundation.org</code></li>
                  <li>Password: <code>[choose a strong password]</code></li>
                  <li>Click "Add User"</li>
                  <li>Copy the generated User UID</li>
                </ul>
              </div>

              <div>
                <h4>3. Create User Document in Firestore</h4>
                <ul>
                  <li>Go to Firestore Database</li>
                  <li>Create collection: <code>users</code></li>
                  <li>Document ID: <code>[paste the User UID]</code></li>
                  <li>Add these fields:
                    <pre style={{backgroundColor: '#f5f5f5', padding: 'var(--spacing-2)', borderRadius: 'var(--radius)'}}>
{`{
  name: "System Administrator",
  email: "admin@tearsfoundation.org",
  role: "admin",
  isActive: true,
  createdAt: [current timestamp]
}`}</pre>
                  </li>
                </ul>
              </div>

              <div className="alert alert-info" style={{marginTop: 'var(--spacing-4)'}}>
                <p>After completing these steps, you can <a href="/admin/login">login here</a> with the credentials you created.</p>
              </div>
            </div>
          )}

          <div style={{textAlign: 'center', marginTop: 'var(--spacing-4)'}}>
            <p>
              <a href="/admin/login" style={{color: 'var(--primary-blue)', textDecoration: 'none'}}>
                ← Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualSetup;