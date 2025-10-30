// src/pages/PublicCaseTracker.js
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

// Import your logo - choose one of these options:
import tearsLogo from '../firebase/logo.webp'; 

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
      const casesQuery = query(
        collection(db, 'cases'),
        where('caseId', '==', searchId.toUpperCase())
      );
      
      const snapshot = await getDocs(casesQuery);
      
      if (!snapshot.empty) {
        const caseDoc = snapshot.docs[0];
        const data = caseDoc.data();
        
        const publicData = {
          id: caseDoc.id,
          caseId: data.caseId,
          status: data.publicStatus || data.status,
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

  const getStatusConfig = (status) => {
    const statusMap = {
      'new': { color: '#e74c3c', bgColor: '#fee', label: 'Under Review' },
      'inProgress': { color: '#f39c12', bgColor: '#fff3cd', label: 'In Progress' },
      'closed': { color: '#27ae60', bgColor: '#e8f5e8', label: 'Resolved' },
      'resolved': { color: '#27ae60', bgColor: '#e8f5e8', label: 'Resolved' },
      'Under Review': { color: '#e74c3c', bgColor: '#fee', label: 'Under Review' },
      'In Progress': { color: '#f39c12', bgColor: '#fff3cd', label: 'In Progress' },
      'Resolved': { color: '#27ae60', bgColor: '#e8f5e8', label: 'Resolved' }
    };
    return statusMap[status] || statusMap.new;
  };

  const getPriorityConfig = (priority) => {
    const config = {
      'high': { color: '#e74c3c', bgColor: '#fee', label: 'High' },
      'medium': { color: '#f39c12', bgColor: '#fff3cd', label: 'Medium' },
      'low': { color: '#27ae60', bgColor: '#e8f5e8', label: 'Low' }
    };
    return config[priority] || config.medium;
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--secondary-gray-light) 100%)',
      padding: 'var(--spacing-8) var(--spacing-4)'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%'
      }}>
        {/* Login-style Card */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-gray)',
          padding: 'var(--spacing-8)',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          marginBottom: 'var(--spacing-6)'
        }}>
          {/* Header with Logo */}
          <div style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-8)'
          }}>
            <div style={{
                         width: '80px',
                         height: '80px',
                         backgroundColor: 'var(--white)',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         margin: '0 auto var(--spacing-4)',
                         border: '2px solid var(--primary-blue)',
                         padding: 'var(--spacing-2)'
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
            <h1 style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: '600',
              color: 'var(--text-dark)',
              marginBottom: 'var(--spacing-2)'
            }}>
              TEARS Foundation
            </h1>
            <p style={{
              fontSize: 'var(--font-size-base)',
              color: 'var(--text-gray)',
              margin: 0
            }}>
              Case Tracking System
            </p>
          </div>

          {/* Search Form */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              color: 'var(--text-dark)',
              marginBottom: 'var(--spacing-2)'
            }}>
              Track Your Case
            </h2>
            <p style={{ 
              color: 'var(--text-gray)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Enter your Case ID to check the status and progress
            </p>
          </div>
          
          <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            <div className="form-group">
              <label className="form-label" style={{
                display: 'block',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '500',
                color: 'var(--text-dark)',
                marginBottom: 'var(--spacing-2)'
              }}>
                Case ID
              </label>
              <input
                type="text"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="Enter Case ID (e.g., TEARS-123456)"
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  border: '1px solid var(--border-gray)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-base)',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-gray)'}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 'var(--spacing-3)',
                backgroundColor: loading ? 'var(--border-gray)' : 'var(--primary-blue)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontWeight: '500',
                fontSize: 'var(--font-size-base)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                marginTop: 'var(--spacing-2)'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = 'var(--primary-blue-dark)')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = 'var(--primary-blue)')}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ 
                    width: '16px', 
                    height: '16px', 
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: 'var(--spacing-2)'
                  }}></span>
                  Searching...
                </span>
              ) : (
                'Track Case'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div style={{
              marginTop: 'var(--spacing-4)',
              padding: 'var(--spacing-3)',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              color: '#c33',
              fontSize: 'var(--font-size-sm)'
            }}>
              {error}
            </div>
          )}

          {/* Instructions */}
          {!caseData && !loading && !error && (
            <div style={{
              marginTop: 'var(--spacing-6)',
              paddingTop: 'var(--spacing-4)',
              borderTop: '1px solid var(--border-gray)'
            }}>
              <h4 style={{
                fontSize: 'var(--font-size-sm)',
                fontWeight: '600',
                color: 'var(--text-dark)',
                marginBottom: 'var(--spacing-3)',
                textAlign: 'center'
              }}>
                How to find your Case ID
              </h4>
              <div style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                lineHeight: '1.5'
              }}>
                <p style={{ margin: '0 0 var(--spacing-2) 0' }}>
                  • Check your confirmation email from TEARS Foundation
                </p>
                <p style={{ margin: '0 0 var(--spacing-2) 0' }}>
                  • Look for the Case ID in your intake documents
                </p>
                <p style={{ margin: '0' }}>
                  • Contact support if you cannot locate your Case ID
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Case Details - Appears below the login card */}
        {caseData && (
          <div style={{
            backgroundColor: 'var(--white)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-gray)',
            padding: 'var(--spacing-6)',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            marginTop: 'var(--spacing-4)'
          }}>
            {/* Case Header */}
            <div style={{
              paddingBottom: 'var(--spacing-4)',
              borderBottom: '1px solid var(--border-gray)',
              marginBottom: 'var(--spacing-4)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 'var(--spacing-3)'
              }}>
                <div>
                  <h3 style={{
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: '600',
                    color: 'var(--text-dark)',
                    margin: 0
                  }}>
                    Case: {caseData.caseId}
                  </h3>
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-gray)',
                    margin: 'var(--spacing-1) 0 0 0'
                  }}>
                    Topic: {formatTopic(caseData.caseTopic)}
                  </p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'flex-end' }}>
                  <span style={{
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    backgroundColor: getStatusConfig(caseData.status).bgColor,
                    color: getStatusConfig(caseData.status).color,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    border: `1px solid ${getStatusConfig(caseData.status).color}20`
                  }}>
                    {getStatusConfig(caseData.status).label}
                  </span>
                  <span style={{
                    padding: 'var(--spacing-1) var(--spacing-3)',
                    backgroundColor: getPriorityConfig(caseData.priority).bgColor,
                    color: getPriorityConfig(caseData.priority).color,
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '500',
                    border: `1px solid ${getPriorityConfig(caseData.priority).color}20`
                  }}>
                    {caseData.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Timeline */}
            <div style={{ marginBottom: 'var(--spacing-6)' }}>
              <h4 style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                color: 'var(--text-dark)',
                marginBottom: 'var(--spacing-4)'
              }}>
                Case Progress
              </h4>
              
              {caseData.progress && caseData.progress.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                  {caseData.progress.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--primary-blue)',
                        flexShrink: 0,
                        marginTop: '2px'
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontWeight: '500',
                          color: 'var(--text-dark)',
                          marginBottom: 'var(--spacing-1)'
                        }}>
                          {item.title}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--text-gray)',
                          marginBottom: 'var(--spacing-1)',
                          lineHeight: '1.4'
                        }}>
                          {item.description}
                        </div>
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-light)'
                        }}>
                          {item.timestamp?.toDate?.().toLocaleDateString() || new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--spacing-4)',
                  color: 'var(--text-light)',
                  backgroundColor: 'var(--secondary-gray-light)',
                  borderRadius: 'var(--radius)',
                  fontSize: 'var(--font-size-sm)'
                }}>
                  No progress updates available yet. Check back later for updates.
                </div>
              )}
            </div>

            {/* Case Meta Information */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 'var(--spacing-4)',
              paddingTop: 'var(--spacing-4)',
              borderTop: '1px solid var(--border-gray)'
            }}>
              <div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Created Date
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)'
                }}>
                  {caseData.createdAt.toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Last Updated
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)'
                }}>
                  {caseData.updatedAt.toLocaleDateString()}
                </div>
              </div>
              <div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '500',
                  color: 'var(--text-dark)',
                  marginBottom: 'var(--spacing-1)'
                }}>
                  Counsellor
                </div>
                <div style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-gray)'
                }}>
                  {caseData.assignedCounsellor}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          textAlign: 'center',
          color: 'var(--text-gray)',
          fontSize: 'var(--font-size-sm)'
        }}>
          <p style={{ margin: 0 }}>
            Need help? Contact TEARS Foundation support at{' '}
            <a href="mailto:support@tears.org" style={{ 
              color: 'var(--primary-blue)',
              textDecoration: 'none'
            }}>
              support@tears.org
            </a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PublicCaseTracker;