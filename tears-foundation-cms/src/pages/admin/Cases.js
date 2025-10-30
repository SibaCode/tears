import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import EnhancedCaseForm from '../../components/admin/EnhancedCaseForm';

const Cases = () => {
  const [cases, setCases] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCase, setEditingCase] = useState(null);
  const [filter, setFilter] = useState('all');
  const { userRole, currentUser } = useAuth();

  useEffect(() => {
    const loadCases = async () => {
      try {
        let casesQuery;
        
        if (userRole === 'counsellor') {
          casesQuery = query(
            collection(db, 'cases'),
            where('assignedCounsellorId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
          );
        } else {
          casesQuery = query(
            collection(db, 'cases'),
            orderBy('updatedAt', 'desc')
          );
        }

        const snapshot = await getDocs(casesQuery);
        const casesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCases(casesData);
      } catch (error) {
        console.error('Error loading cases:', error);
      }
    };

    loadCases();
  }, [userRole, currentUser]);

  const handleDeleteCase = async (caseId, caseName) => {
    if (!window.confirm(`Are you sure you want to delete case for ${caseName}?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'cases', caseId));
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Error deleting case. Please try again.');
    }
  };

  const filteredCases = cases.filter(caseItem => {
    if (filter === 'all') return true;
    return caseItem.status === filter;
  });

  const getStatusConfig = (status) => {
    const config = {
      new: { color: '#e74c3c', bgColor: '#fee', label: 'New' },
      inProgress: { color: '#f39c12', bgColor: '#fff3cd', label: 'In Progress' },
      closed: { color: '#27ae60', bgColor: '#e8f5e8', label: 'Closed' }
    };
    return config[status] || config.new;
  };

  const getUrgencyConfig = (urgency) => {
    const config = {
      low: { color: '#27ae60', bgColor: '#e8f5e8', label: 'Low' },
      medium: { color: '#f39c12', bgColor: '#fff3cd', label: 'Medium' },
      high: { color: '#e74c3c', bgColor: '#fee', label: 'High' }
    };
    return config[urgency] || config.medium;
  };

  if (showForm || editingCase) {
    return (
      <div style={{padding: 'var(--spacing-6)'}}>
        <EnhancedCaseForm 
          caseData={editingCase}
          onSave={() => {
            setShowForm(false);
            setEditingCase(null);
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingCase(null);
          }}
        />
      </div>
    );
  }

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'var(--spacing-8)'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: '600',
            color: 'var(--text-dark)',
            marginBottom: 'var(--spacing-2)'
          }}>
            {userRole === 'counsellor' ? 'My Cases' : 'Case Management'}
          </h1>
          <p style={{
            color: 'var(--text-gray)',
            fontSize: 'var(--font-size-base)',
            margin: 0
          }}>
            Manage and track all case information
          </p>
        </div>
        
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <button 
            style={{
              padding: 'var(--spacing-3) var(--spacing-5)',
              backgroundColor: 'var(--primary-blue)',
              color: 'var(--white)',
              border: 'none',
              borderRadius: 'var(--radius)',
              fontWeight: '500',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'var(--primary-blue-dark)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'var(--primary-blue)'}
            onClick={() => setShowForm(true)}
          >
            New Case
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-4)',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            Total Cases
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: 'var(--text-dark)'}}>
            {cases.length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            New Cases
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: '#e74c3c'}}>
            {cases.filter(c => c.status === 'new').length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            In Progress
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: '#f39c12'}}>
            {cases.filter(c => c.status === 'inProgress').length}
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          padding: 'var(--spacing-4)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border-gray)'
        }}>
          <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--text-gray)', marginBottom: 'var(--spacing-1)'}}>
            Closed
          </div>
          <div style={{fontSize: 'var(--font-size-2xl)', fontWeight: '600', color: '#27ae60'}}>
            {cases.filter(c => c.status === 'closed').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: 'var(--white)',
        padding: 'var(--spacing-4)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-gray)',
        marginBottom: 'var(--spacing-6)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-4)',
          flexWrap: 'wrap'
        }}>
          <span style={{
            fontWeight: '500',
            color: 'var(--text-dark)',
            fontSize: 'var(--font-size-sm)'
          }}>Filter:</span>
          
          <select 
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              border: '1px solid var(--border-gray)',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--white)',
              fontSize: 'var(--font-size-sm)',
              minWidth: '140px'
            }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Cases</option>
            <option value="new">New</option>
            <option value="inProgress">In Progress</option>
            <option value="closed">Closed</option>
          </select>

          <span style={{
            color: 'var(--text-light)',
            fontSize: 'var(--font-size-sm)',
            marginLeft: 'auto'
          }}>
            {filteredCases.length} cases
          </span>
        </div>
      </div>

      {/* Cases Table */}
      <div style={{
        backgroundColor: 'var(--white)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border-gray)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          padding: 'var(--spacing-4)',
          borderBottom: '1px solid var(--border-gray)',
          backgroundColor: 'var(--secondary-gray-light)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
            gap: 'var(--spacing-4)',
            alignItems: 'center'
          }}>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Case ID</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Survivor</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Status</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Urgency</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Last Updated</div>
            <div style={{fontWeight: '600', fontSize: 'var(--font-size-sm)', color: 'var(--text-dark)'}}>Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div>
          {filteredCases.length === 0 ? (
            <div style={{
              padding: 'var(--spacing-12)',
              textAlign: 'center',
              color: 'var(--text-light)'
            }}>
              <div style={{fontSize: 'var(--font-size-xl)', marginBottom: 'var(--spacing-3)'}}>📋</div>
              <div style={{fontSize: 'var(--font-size-base)', fontWeight: '500', marginBottom: 'var(--spacing-2)'}}>
                No cases found
              </div>
              <div style={{fontSize: 'var(--font-size-sm)'}}>
                {cases.length === 0 ? 'Get started by creating your first case' : 'Try adjusting your filters'}
              </div>
            </div>
          ) : (
            filteredCases.map((caseItem) => {
              const statusConfig = getStatusConfig(caseItem.status);
              const urgencyConfig = getUrgencyConfig(caseItem.urgency);
              
              return (
                <div key={caseItem.id} style={{
                  padding: 'var(--spacing-4)',
                  borderBottom: '1px solid var(--border-gray)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'var(--secondary-gray-light)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'var(--white)'}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr 1fr',
                    gap: 'var(--spacing-4)',
                    alignItems: 'center'
                  }}>
                    {/* Case ID */}
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-dark)',
                      fontWeight: '500'
                    }}>
                      {caseItem.caseId}
                    </div>

                    {/* Survivor Info */}
                    <div>
                      <div style={{
                        fontWeight: '500',
                        color: 'var(--text-dark)',
                        marginBottom: 'var(--spacing-1)'
                      }}>
                        {caseItem.survivorName}
                      </div>
                      {caseItem.survivorAge && (
                        <div style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--text-light)'
                        }}>
                          Age: {caseItem.survivorAge}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: statusConfig.bgColor,
                        color: statusConfig.color,
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        border: `1px solid ${statusConfig.color}20`
                      }}>
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Urgency */}
                    <div>
                      <span style={{
                        display: 'inline-block',
                        padding: 'var(--spacing-1) var(--spacing-2)',
                        backgroundColor: urgencyConfig.bgColor,
                        color: urgencyConfig.color,
                        borderRadius: 'var(--radius-full)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: '500',
                        border: `1px solid ${urgencyConfig.color}20`
                      }}>
                        {urgencyConfig.label}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--text-gray)'
                    }}>
                      {caseItem.updatedAt ? new Date(caseItem.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </div>

                    {/* Actions */}
                    <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
                      <button
                        style={{
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          backgroundColor: 'transparent',
                          color: 'var(--primary-blue)',
                          border: '1px solid var(--primary-blue)',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'var(--primary-blue)';
                          e.target.style.color = 'var(--white)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--primary-blue)';
                        }}
                        onClick={() => setEditingCase(caseItem)}
                      >
                        Edit
                      </button>
                      
                      <button
                        style={{
                          padding: 'var(--spacing-1) var(--spacing-2)',
                          backgroundColor: 'transparent',
                          color: 'var(--error-red)',
                          border: '1px solid var(--error-red)',
                          borderRadius: 'var(--radius)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: '500',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.backgroundColor = 'var(--error-red)';
                          e.target.style.color = 'var(--white)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.color = 'var(--error-red)';
                        }}
                        onClick={() => handleDeleteCase(caseItem.id, caseItem.survivorName)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Cases;