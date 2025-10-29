// src/components/admin/EditCounsellor.js
import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const EditCounsellor = ({ user, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'counsellor',
    specialization: user.specialization || [],
    maxCases: user.maxCases || 15,
    isActive: user.isActive !== undefined ? user.isActive : true
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
    setLoading(true);

    try {
      // Prepare update data
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        updatedAt: new Date()
      };

      // Only add specialization and maxCases for counsellors
      if (formData.role === 'counsellor') {
        updateData.specialization = formData.specialization;
        updateData.maxCases = formData.maxCases;
      } else {
        // Remove specialization and maxCases if changing from counsellor to admin
        updateData.specialization = [];
        updateData.maxCases = null;
      }

      await updateDoc(doc(db, 'users', user.id), updateData);
      onSuccess();

    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user. Please try again.');
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
    } else if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
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
        <h3>Edit User: {user.name}</h3>
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

          <div className="form-group">
            <label style={{display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)'}}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active User
            </label>
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
              {loading ? 'Updating...' : 'Update User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCounsellor;