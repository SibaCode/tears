// src/pages/PublicCaseTracker.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const PublicCaseTracker = () => {
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [caseId, setCaseId] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

  // Check for case ID in URL parameters
  useEffect(() => {
    const urlCaseId = searchParams.get('caseId');
    if (urlCaseId) {
      setCaseId(urlCaseId);
      fetchCase(urlCaseId);
    }
  }, [searchParams]);

  const fetchCase = async (searchId) => {
    if (!searchId.trim()) {
      setError('Please enter a case ID');
      return;
    }

    setLoading(true);
    setError('');
    setCaseData(null);

    try {
      // Search for case by caseId field in the database
      const casesQuery = query(
        collection(db, 'cases'),
        where('caseId', '==', searchId.toUpperCase())
      );
      
      const snapshot = await getDocs(casesQuery);
      
      if (!snapshot.empty) {
        const caseDoc = snapshot.docs[0];
        const data = caseDoc.data();
        
        // Only show limited public information
        const publicData = {
          id: caseDoc.id,
          caseId: data.caseId,
          status: data.publicStatus || data.status, // Use publicStatus if available
          caseTopic: data.caseTopic,
          priority: data.priority,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date(),
          progress: data.progress || [],
          publicNotes: data.publicNotes || [],
          assignedCounsellor: data.assignedCounsellorId ? 'Assigned' : 'Not Assigned'
        };
        
        setCaseData(publicData);
      } else {
        setError('Case not found. Please check your Case ID and try again.');
      }
    } catch (err) {
      console.error('Error fetching case:', err);
      if (err.code === 'failed-precondition') {
        setError('Search temporarily unavailable. Please try again later.');
      } else {
        setError('Error fetching case details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (caseId.trim()) {
      setSearchParams({ caseId: caseId.trim() });
      fetchCase(caseId.trim());
    } else {
      setError('Please enter a Case ID');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'inProgress': return '#f39c12';
      case 'closed': return '#27ae60';
      case 'resolved': return '#27ae60';
      case 'Under Review': return '#e74c3c';
      case 'In Progress': return '#f39c12';
      case 'Resolved': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'new': 'Under Review',
      'inProgress': 'In Progress',
      'closed': 'Resolved',
      'resolved': 'Resolved'
    };
    return statusMap[status] || status;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#e74c3c';
      case 'medium': return '#f39c12';
      case 'low': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const formatTopic = (topic) => {
    if (!topic) return 'General';
    return topic.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--secondary-gray-light)',
      padding: 'var(--spacing-6)'
    }}>
      <div style={{ 
        maxWidth: '800px', 
        margin: '0 auto',
        backgroundColor: 'white',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'var(--primary-blue)',
          color: 'white',
          padding: 'var(--spacing-6)',
          textAlign: 'center'
        }}>
          <h1 style={{ marginBottom: 'var(--spacing-2)' }}>
            TEARS Foundation
          </h1>
          <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9 }}>
            Case Tracking System
          </p>
        </div>

        {/* Search Section */}
        <div style={{ padding: 'var(--spacing-6)' }}>
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h2>Track Your Case</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: 'var(--spacing-4)' }}>
              Enter your Case ID to check the status and progress
            </p>
            
            <form onSubmit={handleSearch} style={{ maxWidth: '400px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                <input
                  type="text"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  placeholder="Enter your Case ID (e.g., TEARS-123456)"
                  style={{
                    flex: 1,
                    padding: 'var(--spacing-3)',
                    border: '2px solid var(--border-gray)',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-base)'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    backgroundColor: 'var(--primary-blue)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                    fontWeight: '600',
                    minWidth: '100px'
                  }}
                >
                  {loading ? 'Searching...' : 'Track'}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: 'var(--spacing-4)',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--spacing-4)',
              textAlign: 'center'
            }}>
              ❌ {error}
            </div>
          )}

          {/* Case Details */}
          {caseData && (
            <div style={{
              border: '1px solid var(--border-gray)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden'
            }}>
              {/* Case Header */}
              <div style={{
                backgroundColor: 'var(--secondary-gray-light)',
                padding: 'var(--spacing-4)',
                borderBottom: '1px solid var(--border-gray)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-2)' }}>
                  <h3 style={{ margin: 0 }}>Case: {caseData.caseId}</h3>
                  <div style={{ display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: getStatusColor(caseData.status),
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {getStatusText(caseData.status)}
                    </span>
                    <span style={{
                      padding: 'var(--spacing-1) var(--spacing-3)',
                      backgroundColor: getPriorityColor(caseData.priority),
                      color: 'white',
                      borderRadius: 'var(--radius-full)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {caseData.priority} Priority
                    </span>
                  </div>
                </div>
                <p style={{ margin: 'var(--spacing-2) 0 0 0', color: 'var(--text-gray)' }}>
                  Topic: {formatTopic(caseData.caseTopic)}
                </p>
              </div>

              {/* Case Timeline */}
              <div style={{ padding: 'var(--spacing-4)' }}>
                <h4 style={{ marginBottom: 'var(--spacing-4)' }}>Case Progress</h4>
                
                <div style={{ position: 'relative' }}>
                  {/* Progress Timeline */}
                  {(caseData.progress && caseData.progress.length > 0) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                      {caseData.progress.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                          <div style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--primary-blue)',
                            flexShrink: 0,
                            marginTop: '2px'
                          }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: '600', margin: '0 0 var(--spacing-1) 0' }}>
                              {item.title}
                            </p>
                            <p style={{ color: 'var(--text-gray)', margin: '0 0 var(--spacing-1) 0' }}>
                              {item.description}
                            </p>
                            <small style={{ color: 'var(--text-light)' }}>
                              {item.timestamp?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString()}
                            </small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      textAlign: 'center', 
                      padding: 'var(--spacing-6)',
                      color: 'var(--text-light)'
                    }}>
                      No progress updates available yet. Check back later for updates.
                    </div>
                  )}
                </div>

                {/* Public Notes */}
                {caseData.publicNotes && caseData.publicNotes.length > 0 && (
                  <div style={{ marginTop: 'var(--spacing-6)' }}>
                    <h4 style={{ marginBottom: 'var(--spacing-4)' }}>Notes</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
                      {caseData.publicNotes.map((note, index) => (
                        <div key={index} style={{
                          padding: 'var(--spacing-3)',
                          backgroundColor: 'var(--secondary-gray-light)',
                          borderRadius: 'var(--radius)',
                          borderLeft: '4px solid var(--primary-blue)'
                        }}>
                          <p style={{ margin: 0 }}>{note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Case Meta Information */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--spacing-4)',
                  marginTop: 'var(--spacing-6)',
                  paddingTop: 'var(--spacing-4)',
                  borderTop: '1px solid var(--border-gray)'
                }}>
                  <div>
                    <strong>Created Date:</strong>
                    <p>{caseData.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <strong>Last Updated:</strong>
                    <p>{caseData.updatedAt.toLocaleDateString()}</p>
                  </div>
                  <div>
                    <strong>Counsellor:</strong>
                    <p>{caseData.assignedCounsellor}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!caseData && !loading && !error && (
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-6)',
              color: 'var(--text-gray)'
            }}>
              <h3>How to Track Your Case</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--spacing-4)',
                marginTop: 'var(--spacing-4)'
              }}>
                <div style={{ padding: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>1️⃣</div>
                  <h4>Get Your Case ID</h4>
                  <p>You should have received a Case ID (e.g., TEARS-123456) when your case was registered</p>
                </div>
                <div style={{ padding: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>2️⃣</div>
                  <h4>Enter Case ID</h4>
                  <p>Type your Case ID exactly as provided in the search box above</p>
                </div>
                <div style={{ padding: 'var(--spacing-4)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>3️⃣</div>
                  <h4>View Progress</h4>
                  <p>See your case status, updates, and progress timeline</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: 'var(--secondary-gray-light)',
          padding: 'var(--spacing-4)',
          textAlign: 'center',
          borderTop: '1px solid var(--border-gray)',
          color: 'var(--text-gray)'
        }}>
          <p style={{ margin: 0 }}>
            Need help? Contact TEARS Foundation support at{' '}
            <a href="mailto:support@tears.org" style={{ color: 'var(--primary-blue)' }}>
              support@tears.org
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicCaseTracker;