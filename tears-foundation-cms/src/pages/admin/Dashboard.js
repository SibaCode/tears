// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [cases, setCases] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [stats, setStats] = useState({
    totalCases: 0,
    newCases: 0,
    inProgressCases: 0,
    closedCases: 0,
    newHelpRequests: 0
  });
  const { userRole, currentUser } = useAuth();

  useEffect(() => {
    // Fetch cases based on user role
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

    const unsubscribeCases = onSnapshot(casesQuery, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCases(casesData);
      
      setStats(prev => ({
        ...prev,
        totalCases: casesData.length,
        newCases: casesData.filter(c => c.status === 'new').length,
        inProgressCases: casesData.filter(c => c.status === 'inProgress').length,
        closedCases: casesData.filter(c => c.status === 'closed').length
      }));
    });

    // Fetch help requests
    const helpRequestsQuery = query(
      collection(db, 'helpRequests'),
      where('status', '==', 'new'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeHelpRequests = onSnapshot(helpRequestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setHelpRequests(requestsData);
      setStats(prev => ({
        ...prev,
        newHelpRequests: requestsData.length
      }));
    });

    return () => {
      unsubscribeCases();
      unsubscribeHelpRequests();
    };
  }, [userRole, currentUser]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'inProgress': return '#f39c12';
      case 'closed': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      {/* Header */}
      <div style={{marginBottom: 'var(--spacing-8)'}}>
        <h1 style={{
          fontSize: 'var(--font-size-3xl)', 
          fontWeight: '700', 
          color: 'var(--text-dark)', 
          marginBottom: 'var(--spacing-2)'
        }}>
          Dashboard Overview
        </h1>
        <p style={{
          color: 'var(--text-gray)',
          fontSize: 'var(--font-size-lg)'
        }}>
          Welcome back! Here's what's happening today.
        </p>
      </div>

      {/* Statistics Cards - Modern Design */}
      <div style={{
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: 'var(--spacing-6)', 
        marginBottom: 'var(--spacing-8)'
      }}>
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '4px solid var(--primary-blue)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)'}}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: 'var(--primary-blue-light)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-3)'
            }}>
              <span style={{fontSize: 'var(--font-size-xl)', color: 'var(--primary-blue)'}}>📋</span>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                margin: 0,
                fontWeight: '500'
              }}>Total Cases</p>
              <p style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: '700',
                color: 'var(--text-dark)',
                margin: 0
              }}>{stats.totalCases}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '4px solid var(--success-green)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)'}}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e8f5e8',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-3)'
            }}>
              <span style={{fontSize: 'var(--font-size-xl)', color: 'var(--success-green)'}}>🆕</span>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                margin: 0,
                fontWeight: '500'
              }}>New Cases</p>
              <p style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: '700',
                color: 'var(--text-dark)',
                margin: 0
              }}>{stats.newCases}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '4px solid var(--warning-yellow)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)'}}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fff8e1',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-3)'
            }}>
              <span style={{fontSize: 'var(--font-size-xl)', color: 'var(--warning-yellow)'}}>🔄</span>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                margin: 0,
                fontWeight: '500'
              }}>In Progress</p>
              <p style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: '700',
                color: 'var(--text-dark)',
                margin: 0
              }}>{stats.inProgressCases}</p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderLeft: '4px solid var(--success-green)'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)'}}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#e8f5e8',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-3)'
            }}>
              <span style={{fontSize: 'var(--font-size-xl)', color: 'var(--success-green)'}}>✅</span>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                margin: 0,
                fontWeight: '500'
              }}>Closed Cases</p>
              <p style={{
                fontSize: 'var(--font-size-3xl)',
                fontWeight: '700',
                color: 'var(--text-dark)',
                margin: 0
              }}>{stats.closedCases}</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-6)'}}>
        {/* Quick Actions */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-4)',
            color: 'var(--text-dark)'
          }}>Quick Actions</h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)'}}>
            <Link 
              to="/admin/cases?new=true"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 'var(--spacing-4)',
                backgroundColor: 'var(--primary-blue)',
                color: 'var(--white)',
                borderRadius: 'var(--radius-lg)',
                textDecoration: 'none',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = 'var(--primary-blue-dark)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'var(--primary-blue)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <span style={{marginRight: 'var(--spacing-3)', fontSize: 'var(--font-size-lg)'}}>+</span>
              Create New Case
            </Link>
            
            {userRole === 'admin' && (
              <Link 
                to="/admin/users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--spacing-4)',
                  backgroundColor: 'var(--secondary-gray-light)',
                  color: 'var(--text-dark)',
                  borderRadius: 'var(--radius-lg)',
                  textDecoration: 'none',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = 'var(--border-gray)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'var(--secondary-gray-light)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span style={{marginRight: 'var(--spacing-3)', fontSize: 'var(--font-size-lg)'}}>👥</span>
                Manage Users
              </Link>
            )}
          </div>
        </div>

        {/* Recent Cases */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-4)'}}>
            <h2 style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: '600',
              color: 'var(--text-dark)'
            }}>Recent Cases</h2>
            <Link 
              to="/admin/cases"
              style={{
                color: 'var(--primary-blue)',
                fontWeight: '500',
                textDecoration: 'none',
                fontSize: 'var(--font-size-sm)'
              }}
            >
              View All →
            </Link>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)'}}>
            {cases.slice(0, 5).map((caseItem) => (
              <div key={caseItem.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--secondary-gray-light)',
                borderRadius: 'var(--radius)',
                borderLeft: `4px solid ${getStatusColor(caseItem.status)}`
              }}>
                <div>
                  <p style={{
                    fontWeight: '600',
                    margin: '0 0 var(--spacing-1) 0',
                    color: 'var(--text-dark)'
                  }}>
                    {caseItem.survivorName || 'Unnamed Survivor'}
                  </p>
                  <p style={{
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-gray)',
                    margin: 0
                  }}>
                    {caseItem.caseId || 'No Case ID'}
                  </p>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span style={{
                    padding: 'var(--spacing-1) var(--spacing-2)',
                    backgroundColor: getStatusColor(caseItem.status),
                    color: 'white',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {caseItem.status}
                  </span>
                  <p style={{
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-light)',
                    margin: 'var(--spacing-1) 0 0 0'
                  }}>
                    {caseItem.updatedAt ? new Date(caseItem.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            ))}
            
            {cases.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: 'var(--spacing-8)',
                color: 'var(--text-light)'
              }}>
                No cases found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Help Requests Alert */}
      {userRole === 'admin' && stats.newHelpRequests > 0 && (
        <div style={{
          marginTop: 'var(--spacing-6)',
          padding: 'var(--spacing-4)',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{
              marginBottom: 'var(--spacing-1)',
              color: '#856404',
              fontSize: 'var(--font-size-lg)'
            }}>
              ⚡ New Help Requests
            </h3>
            <p style={{
              color: '#856404',
              margin: 0,
              fontSize: 'var(--font-size-sm)'
            }}>
              {stats.newHelpRequests} new requests need your attention
            </p>
          </div>
          <Link 
            to="/admin/cases"
            style={{
              padding: 'var(--spacing-2) var(--spacing-4)',
              backgroundColor: 'var(--warning-yellow)',
              color: 'white',
              borderRadius: 'var(--radius)',
              textDecoration: 'none',
              fontWeight: '500',
              fontSize: 'var(--font-size-sm)'
            }}
          >
            Review Now
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;