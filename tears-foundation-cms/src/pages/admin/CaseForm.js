// src/components/admin/CaseForm.js
import React, { useState } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const CaseForm = ({ caseData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    survivorName: '',
    survivorAge: '',
    contactInfo: '',
    caseDetails: '',
    status: 'new',
    urgency: 'medium',
    assignedCounsellorId: '',
    ...caseData
  });
  const [loading, setLoading] = useState(false);
  const { userRole, currentUser } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const caseDataToSave = {
        ...formData,
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      };

      if (caseData?.id) {
        // Update existing case
        await updateDoc(doc(db, 'cases', caseData.id), caseDataToSave);
      } else {
        // Create new case
        caseDataToSave.createdAt = new Date();
        caseDataToSave.createdBy = currentUser.uid;
        caseDataToSave.caseId = `CASE-${Date.now()}`;
        
        await addDoc(collection(db, 'cases'), caseDataToSave);
      }

      onSave();
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Error saving case. Please try again.');
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

  return (
    <div className="card">
      <div className="card-header">
        <h3>{caseData ? 'Edit Case' : 'Create New Case'}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-4)'}}>
            <div className="form-group">
              <label className="form-label">Survivor Name *</label>
              <input
                type="text"
                name="survivorName"
                className="form-input"
                value={formData.survivorName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                name="survivorAge"
                className="form-input"
                value={formData.survivorAge}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Contact Information *</label>
            <textarea
              name="contactInfo"
              className="form-textarea"
              rows="3"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="Phone, email, safe contact methods..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Case Details *</label>
            <textarea
              name="caseDetails"
              className="form-textarea"
              rows="5"
              value={formData.caseDetails}
              onChange={handleChange}
              placeholder="Describe the situation, needs, and initial assessment..."
              required
            />
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--spacing-4)'}}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="new">New</option>
                <option value="inProgress">In Progress</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Urgency</label>
              <select
                name="urgency"
                className="form-select"
                value={formData.urgency}
                onChange={handleChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {userRole === 'admin' && (
              <div className="form-group">
                <label className="form-label">Assign Counsellor</label>
                <input
                  type="text"
                  name="assignedCounsellorId"
                  className="form-input"
                  value={formData.assignedCounsellorId}
                  onChange={handleChange}
                  placeholder="Counsellor User ID"
                />
              </div>
            )}
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
              {loading ? 'Saving...' : (caseData ? 'Update Case' : 'Create Case')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseForm;