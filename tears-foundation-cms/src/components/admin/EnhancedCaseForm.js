// src/components/admin/EnhancedCaseForm.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const EnhancedCaseForm = ({ caseData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    survivorName: '',
    survivorAge: '',
    contactInfo: '',
    caseTopic: 'general',
    caseDescription: '',
    urgency: 'medium',
    assignedCounsellorId: '',
    ...caseData
  });
  
  const [counsellors, setCounsellors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredCounsellors, setFilteredCounsellors] = useState([]);
  const [inHouseCounsellors, setInHouseCounsellors] = useState([]);
  
  // Move useAuth to the top level of the component
  const { userRole, currentUser } = useAuth();

  // Available case topics
  const caseTopics = [
    { value: 'general', label: 'General Support' },
    { value: 'domestic_violence', label: 'Domestic Violence' },
    { value: 'sexual_assault', label: 'Sexual Assault/Rape' },
    { value: 'child_abuse', label: 'Child Abuse' },
    { value: 'trauma', label: 'Trauma Counselling' },
    { value: 'legal_support', label: 'Legal Support' },
    { value: 'crisis', label: 'Crisis Intervention' },
    { value: 'family', label: 'Family Therapy' },
    { value: 'substance_abuse', label: 'Substance Abuse' },
    { value: 'mental_health', label: 'Mental Health Support' }
  ];

  // Load available counsellors
  useEffect(() => {
    const loadCounsellors = async () => {
      if (userRole === 'admin' || userRole === 'superadmin') {
        try {
          const counsellorsQuery = query(
            collection(db, 'users'),
            where('role', '==', 'counsellor'),
            where('isActive', '==', true)
          );
          const snapshot = await getDocs(counsellorsQuery);
          const counsellorsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCounsellors(counsellorsData);
          
          // Find in-house counsellors (those without specific specializations or with general specialization)
          const inHouse = counsellorsData.filter(counsellor => {
            const specializations = Array.isArray(counsellor.specialization) 
              ? counsellor.specialization 
              : (counsellor.specialization ? [counsellor.specialization] : []);
            
            return specializations.length === 0 || 
                   specializations.includes('general') ||
                   specializations.some(spec => spec.toLowerCase().includes('general'));
          });
          setInHouseCounsellors(inHouse);
        } catch (error) {
          console.error('Error loading counsellors:', error);
        }
      }
    };

    loadCounsellors();
  }, [userRole]);

  // Filter counsellors when case topic changes
  useEffect(() => {
    if (formData.caseTopic === 'general') {
      setFilteredCounsellors(counsellors);
    } else {
      const matchedCounsellors = counsellors.filter(counsellor => {
        const specializations = Array.isArray(counsellor.specialization) 
          ? counsellor.specialization 
          : (counsellor.specialization ? [counsellor.specialization] : []);
        
        return specializations.includes(formData.caseTopic) || 
               specializations.some(spec => spec.toLowerCase().includes(formData.caseTopic));
      });
      
      // If no matching counsellors found, use in-house counsellors
      if (matchedCounsellors.length === 0) {
        setFilteredCounsellors(inHouseCounsellors);
      } else {
        setFilteredCounsellors(matchedCounsellors);
      }
    }
  }, [formData.caseTopic, counsellors, inHouseCounsellors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const caseDataToSave = {
        ...formData,
        status: 'new', // Automatically set status to 'new'
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      };

      if (caseData?.id) {
        await updateDoc(doc(db, 'cases', caseData.id), caseDataToSave);
      } else {
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

  // Helper function to format specialization display
  const formatSpecialization = (specialization) => {
    if (Array.isArray(specialization)) {
      return specialization.map(spec => {
        const topic = caseTopics.find(t => t.value === spec);
        return topic ? topic.label : spec;
      }).join(', ');
    }
    const topic = caseTopics.find(t => t.value === specialization);
    return topic ? topic.label : (specialization || 'General');
  };

  // Check if we're using in-house counsellors as fallback
  const isUsingInHouseCounsellors = formData.caseTopic !== 'general' && 
    filteredCounsellors.length > 0 && 
    filteredCounsellors.every(counsellor => inHouseCounsellors.some(ih => ih.id === counsellor.id));

  return (
    <div className="card">
      <div className="card-header">
        <h3>{caseData ? 'Edit Case' : 'Create New Case'}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
          
          {/* Basic Survivor Information */}
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
            <label className="form-label">Contact Information *</label>
            <textarea
              name="contactInfo"
              className="form-textarea"
              rows="3"
              value={formData.contactInfo}
              onChange={handleChange}
              placeholder="Phone number, email, safe contact methods..."
              required
            />
          </div>

          {/* Case Topic and Description */}
          <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--spacing-4)'}}>
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
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Case Description *</label>
              <textarea
                name="caseDescription"
                className="form-textarea"
                rows="3"
                value={formData.caseDescription}
                onChange={handleChange}
                placeholder="Describe the situation, needs, and any important details..."
                required
              />
            </div>
          </div>

          {/* Counsellor Assignment Section */}
          {(userRole === 'admin' || userRole === 'superadmin') && (
            <div className="card" style={{backgroundColor: 'var(--primary-blue-light)'}}>
              <div className="card-body">
                <h4 style={{marginBottom: 'var(--spacing-4)'}}>Assign Counsellor</h4>
                
                {isUsingInHouseCounsellors && (
                  <div className="alert alert-info" style={{marginBottom: 'var(--spacing-4)'}}>
                    <strong>Note:</strong> No specialized counsellors found for this topic. Showing in-house general counsellors instead.
                  </div>
                )}
                
                <div className="form-group">
                  <label className="form-label">
                    Available Counsellors for {caseTopics.find(t => t.value === formData.caseTopic)?.label}
                    <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginLeft: 'var(--spacing-2)'}}>
                      ({filteredCounsellors.length} available)
                    </span>
                  </label>
                  
                  {filteredCounsellors.length > 0 ? (
                    <select
                      name="assignedCounsellorId"
                      className="form-select"
                      value={formData.assignedCounsellorId}
                      onChange={handleChange}
                    >
                      <option value="">Select a counsellor...</option>
                      {filteredCounsellors.map(counsellor => (
                        <option key={counsellor.id} value={counsellor.id}>
                          {counsellor.name} - {formatSpecialization(counsellor.specialization)}
                          {inHouseCounsellors.some(ih => ih.id === counsellor.id) && ' (In-House)'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="alert alert-warning">
                      No counsellors available at the moment. Please try again later or contact administration.
                    </div>
                  )}
                </div>

                {/* Counsellor List Preview */}
                {filteredCounsellors.length > 0 && (
                  <div style={{marginTop: 'var(--spacing-4)'}}>
                    <h5 style={{marginBottom: 'var(--spacing-2)'}}>
                      Available Counsellors {isUsingInHouseCounsellors && '(In-House)'}:
                    </h5>
                    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', maxHeight: '200px', overflowY: 'auto'}}>
                      {filteredCounsellors.map(counsellor => (
                        <div 
                          key={counsellor.id}
                          style={{
                            padding: 'var(--spacing-3)',
                            backgroundColor: formData.assignedCounsellorId === counsellor.id ? 'var(--primary-blue)' : 'var(--white)',
                            color: formData.assignedCounsellorId === counsellor.id ? 'var(--white)' : 'var(--secondary-gray-dark)',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid #e5e7eb',
                            cursor: 'pointer'
                          }}
                          onClick={() => setFormData(prev => ({...prev, assignedCounsellorId: counsellor.id}))}
                        >
                          <div style={{fontWeight: '600'}}>
                            {counsellor.name}
                            {inHouseCounsellors.some(ih => ih.id === counsellor.id) && ' (In-House)'}
                          </div>
                          <div style={{fontSize: 'var(--font-size-sm)'}}>
                            Specialization: {formatSpecialization(counsellor.specialization)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Urgency Level Only - Status Removed */}
          <div className="form-group">
            <label className="form-label">Urgency Level</label>
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

export default EnhancedCaseForm;