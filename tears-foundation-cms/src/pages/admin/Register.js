// In src/components/admin/Register.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';

const Register = ({ onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'counsellor', // Default to counsellor
    specialization: [], // Only for counsellors
    maxCases: 15, // Only for counsellors
    isActive: true
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Available specializations for counsellors
  const availableSpecializations = [
    { value: 'domestic_violence', label: 'Domestic Violence' },
    { value: 'sexual_assault', label: 'Sexual Assault/Rape' },
    { value: 'child_abuse', label: 'Child Abuse' },
    { value: 'trauma', label: 'Trauma Counselling' },
    { value: 'legal_support', label: 'Legal Support' },
    { value: 'crisis', label: 'Crisis Intervention' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'substance_abuse', label: 'Substance Abuse' },
    { value: 'mental_health', label: 'Mental Health Support' },
    { value: 'general', label: 'General Counselling' }
  ];

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

      // Prepare user data for Firestore
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: true,
        createdAt: new Date(),
        createdBy: auth.currentUser.uid
      };

      // Only add specialization and maxCases for counsellors
      if (formData.role === 'counsellor') {
        userData.specialization = formData.specialization;
        userData.maxCases = formData.maxCases;
      }

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), userData);

      // Show success message
      alert('User created successfully!');

      // Call onSuccess to close the form and refresh the parent component
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Email address is already in use.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak.');
      } else {
        setError('Failed to create user. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'specialization') {
      setFormData(prev => ({
        ...prev,
        specialization: checked
          ? [...prev.specialization, value]
          : prev.specialization.filter(s => s !== value)
      }));
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3>Register New Staff Member</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
          {error && (
            <div className="alert alert-error">
              {error}
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
              required
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)'}}>
            <div className="form-group">
              <label className="form-label">Role *</label>
              <select
                name="role"
                className="form-select"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="counsellor">Counsellor</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {/* Max Cases - Only show for counsellors */}
            {formData.role === 'counsellor' && (
              <div className="form-group">
                <label className="form-label">Maximum Cases</label>
                <input
                  type="number"
                  name="maxCases"
                  className="form-input"
                  value={formData.maxCases}
                  onChange={handleChange}
                  min="1"
                  max="50"
                />
              </div>
            )}
          </div>

          {/* Specializations - Only show for counsellors */}
          {formData.role === 'counsellor' && (
            <div className="form-group">
              <label className="form-label">Specializations</label>
              <div style={{
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-2)',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: 'var(--spacing-2)',
                border: '1px solid #e5e7eb',
                borderRadius: 'var(--radius-lg)'
              }}>
                {availableSpecializations.map(specialization => (
                  <label 
                    key={specialization.value}
                    style={{
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 'var(--spacing-2)',
                      padding: 'var(--spacing-2)',
                      borderRadius: 'var(--radius)',
                      backgroundColor: formData.specialization.includes(specialization.value) 
                        ? 'var(--primary-blue-light)' 
                        : 'transparent'
                    }}
                  >
                    <input
                      type="checkbox"
                      name="specialization"
                      value={specialization.value}
                      checked={formData.specialization.includes(specialization.value)}
                      onChange={handleChange}
                    />
                    {specialization.label}
                  </label>
                ))}
              </div>
              <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginTop: 'var(--spacing-1)'}}>
                Selected: {formData.specialization.length} specializations
              </div>
            </div>
          )}

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)'}}>
            <div className="form-group">
              <label className="form-label">Password *</label>
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
              <label className="form-label">Confirm Password *</label>
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
          </div>

          <div style={{display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'flex-end', marginTop: 'var(--spacing-4)'}}>
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;