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
    caseTopic: 'general',
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
        // Create new case with public tracking fields
        const caseId = `TEARS-${Date.now().toString().slice(-6)}`;
        
        caseDataToSave.createdAt = new Date();
        caseDataToSave.createdBy = currentUser.uid;
        caseDataToSave.caseId = caseId;
        
        // Add public tracking fields
        caseDataToSave.progress = [
          {
            title: 'Case Registered',
            description: 'Your case has been successfully registered with TEARS Foundation',
            timestamp: new Date()
          }
        ];
        
        caseDataToSave.publicNotes = [
          'Your case has been received and is under review by our team.'
        ];
        
        // Set initial public status based on internal status
        caseDataToSave.publicStatus = getPublicStatus(formData.status);
        
        await addDoc(collection(db, 'cases'), caseDataToSave);
        
        // Show the generated case ID to the user
        alert(`Case created successfully! Case ID: ${caseId}\n\nShare this ID with the survivor for tracking.`);
      }

      onSave();
    } catch (error) {
      console.error('Error saving case:', error);
      alert('Error saving case. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPublicStatus = (internalStatus) => {
    switch (internalStatus) {
      case 'new': return 'Under Review';
      case 'inProgress': return 'In Progress';
      case 'closed': return 'Resolved';
      default: return 'Under Review';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Update public status when internal status changes
    if (name === 'status') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        publicStatus: getPublicStatus(value)
      }));
    }
  };

  const caseTopics = [
    'general',
    'counseling',
    'legal',
    'medical',
    'shelter',
    'employment',
    'education',
    'other'
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3>{caseData ? 'Edit Case' : 'Create New Case'}</h3>
        {!caseData && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginTop: 'var(--spacing-2)' }}>
            A public Case ID will be generated for tracking
          </p>
        )}
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
          
          {/* Case Information Section */}
          <div style={{ 
            padding: 'var(--spacing-4)', 
            backgroundColor: 'var(--secondary-gray-light)', 
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--spacing-2)'
          }}>
            <h4 style={{ marginBottom: 'var(--spacing-3)' }}>Case Information</h4>
            
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
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Case Topic *</label>
              <select
                name="caseTopic"
                className="form-select"
                value={formData.caseTopic}
                onChange={handleChange}
                required
              >
                {caseTopics.map(topic => (
                  <option key={topic} value={topic}>
                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Information */}
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

          {/* Case Details */}
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

          {/* Management Section */}
          <div style={{ 
            padding: 'var(--spacing-4)', 
            backgroundColor: 'var(--secondary-gray-light)', 
            borderRadius: 'var(--radius)',
            marginBottom: 'var(--spacing-2)'
          }}>
            <h4 style={{ marginBottom: 'var(--spacing-3)' }}>1Case Management</h4>
            
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
                <small style={{ color: 'var(--text-light)', fontSize: 'var(--font-size-xs)' }}>
                  Public: {getPublicStatus(formData.status)}
                </small>
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

              {(userRole === 'admin' || userRole === 'super_admin') && (
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
          </div>

          {/* Public Tracking Information */}
          {!caseData && (
            <div style={{ 
              padding: 'var(--spacing-4)', 
              backgroundColor: '#e8f4fd', 
              border: '1px solid var(--primary-blue)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--spacing-2)'
            }}>
              <h4 style={{ color: 'var(--primary-blue)', marginBottom: 'var(--spacing-2)' }}>
                📋 Public Case Tracking
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', margin: 0, color: 'var(--text-gray)' }}>
                After creating this case, a unique Case ID will be generated that the survivor can use to track 
                their case progress at <strong>/track-case</strong> without needing to login.
              </p>
              <ul style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', margin: 'var(--spacing-2) 0', paddingLeft: 'var(--spacing-4)' }}>
                <li>Survivors can see case status and progress updates</li>
                <li>Public notes and timeline will be visible</li>
                <li>Sensitive information remains private</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
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