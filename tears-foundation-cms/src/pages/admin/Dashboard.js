// src/pages/admin/Dashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

// Simple chart components
const PieChart = ({ data, colors, width = 200, height = 200 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const largeArcFlag = angle > 180 ? 1 : 0;
        
        const x1 = width / 2 + (width / 2) * Math.cos(currentAngle * Math.PI / 180);
        const y1 = height / 2 + (height / 2) * Math.sin(currentAngle * Math.PI / 180);
        
        const x2 = width / 2 + (width / 2) * Math.cos((currentAngle + angle) * Math.PI / 180);
        const y2 = height / 2 + (height / 2) * Math.sin((currentAngle + angle) * Math.PI / 180);
        
        const pathData = [
          `M ${width / 2} ${height / 2}`,
          `L ${x1} ${y1}`,
          `A ${width / 2} ${height / 2} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          'Z'
        ].join(' ');

        const slice = (
          <path
            key={index}
            d={pathData}
            fill={colors[index % colors.length]}
            stroke="#fff"
            strokeWidth="2"
          />
        );

        currentAngle += angle;
        return slice;
      })}
      
      {/* Center text */}
      <text
        x={width / 2}
        y={height / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '12px', fontWeight: 'bold', fill: '#333' }}
      >
        {total}
      </text>
      <text
        x={width / 2}
        y={height / 2 + 16}
        textAnchor="middle"
        dominantBaseline="middle"
        style={{ fontSize: '10px', fill: '#666' }}
      >
        Total
      </text>
    </svg>
  );
};

const BarChart = ({ data, colors, width = 300, height = 200 }) => {
  const maxValue = Math.max(...data.map(item => item.value));
  const barWidth = (width - 40) / data.length;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
        <line
          key={index}
          x1="30"
          y1={height - 20 - (ratio * (height - 40))}
          x2={width}
          y2={height - 20 - (ratio * (height - 40))}
          stroke="#e0e0e0"
          strokeWidth="1"
        />
      ))}
      
      {/* Bars */}
      {data.map((item, index) => {
        const barHeight = (item.value / maxValue) * (height - 40);
        return (
          <g key={index}>
            <rect
              x={30 + index * barWidth + 2}
              y={height - 20 - barHeight}
              width={barWidth - 4}
              height={barHeight}
              fill={colors[index % colors.length]}
              rx="2"
            />
            <text
              x={30 + index * barWidth + barWidth / 2}
              y={height - 5}
              textAnchor="middle"
              style={{ fontSize: '10px', fill: '#666' }}
            >
              {item.label}
            </text>
            <text
              x={30 + index * barWidth + barWidth / 2}
              y={height - 25 - barHeight}
              textAnchor="middle"
              style={{ fontSize: '10px', fill: '#333', fontWeight: 'bold' }}
            >
              {item.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

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
  
  const [analytics, setAnalytics] = useState({
    caseTypes: [],
    ageGroups: [],
    priorityDistribution: [],
    monthlyTrends: []
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
      calculateAnalytics(casesData);
      
      setStats(prev => ({
        ...prev,
        totalCases: casesData.length,
        newCases: casesData.filter(c => c.status === 'new').length,
        inProgressCases: casesData.filter(c => c.status === 'inProgress').length,
        closedCases: casesData.filter(c => c.status === 'closed' || c.status === 'resolved').length
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

  const calculateAnalytics = (casesData) => {
    // Case Type Distribution
    const caseTypeCount = {};
    const ageGroupCount = {
      'Under 18': 0,
      '18-25': 0,
      '26-35': 0,
      '36-50': 0,
      '51+': 0
    };
    const priorityCount = {
      'high': 0,
      'medium': 0,
      'low': 0
    };

    casesData.forEach(caseItem => {
      // Case types
      const caseType = caseItem.caseTopic || 'General';
      caseTypeCount[caseType] = (caseTypeCount[caseType] || 0) + 1;

      // Age groups
      if (caseItem.survivorAge) {
        const age = caseItem.survivorAge;
        if (age < 18) ageGroupCount['Under 18']++;
        else if (age <= 25) ageGroupCount['18-25']++;
        else if (age <= 35) ageGroupCount['26-35']++;
        else if (age <= 50) ageGroupCount['36-50']++;
        else ageGroupCount['51+']++;
      }

      // Priority
      if (caseItem.priority && priorityCount.hasOwnProperty(caseItem.priority)) {
        priorityCount[caseItem.priority]++;
      }
    });

    // Format for charts
    const caseTypesData = Object.entries(caseTypeCount)
      .map(([name, value]) => ({
        label: formatCaseTopic(name),
        value
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const ageGroupsData = Object.entries(ageGroupCount)
      .filter(([_, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));

    const priorityData = Object.entries(priorityCount)
      .map(([label, value]) => ({ 
        label: label.charAt(0).toUpperCase() + label.slice(1), 
        value 
      }));

    setAnalytics({
      caseTypes: caseTypesData,
      ageGroups: ageGroupsData,
      priorityDistribution: priorityData,
      monthlyTrends: calculateMonthlyTrends(casesData)
    });
  };

  const calculateMonthlyTrends = (casesData) => {
    const last6Months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      last6Months.push({
        label: date.toLocaleDateString('en-US', { month: 'short' }),
        value: 0
      });
    }

    casesData.forEach(caseItem => {
      const caseDate = caseItem.createdAt?.toDate?.() || new Date();
      const monthIndex = last6Months.findIndex(month => 
        month.label === caseDate.toLocaleDateString('en-US', { month: 'short' })
      );
      if (monthIndex !== -1) {
        last6Months[monthIndex].value++;
      }
    });

    return last6Months;
  };

  const formatCaseTopic = (topic) => {
    if (!topic) return 'General';
    return topic.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return '#e74c3c';
      case 'inProgress': return '#f39c12';
      case 'closed': return '#27ae60';
      case 'resolved': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const chartColors = ['#3498db', '#e74c3c', '#f39c12', '#2ecc71', '#9b59b6', '#1abc9c'];

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

      {/* Statistics Cards */}
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
          borderLeft: '4px solid #e74c3c'
        }}>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-3)'}}>
            <div style={{
              width: '48px',
              height: '48px',
              backgroundColor: '#fee',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 'var(--spacing-3)'
            }}>
              <span style={{fontSize: 'var(--font-size-xl)', color: '#e74c3c'}}>🆕</span>
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
          borderLeft: '4px solid #f39c12'
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
              <span style={{fontSize: 'var(--font-size-xl)', color: '#f39c12'}}>🔄</span>
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
          borderLeft: '4px solid #27ae60'
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
              <span style={{fontSize: 'var(--font-size-xl)', color: '#27ae60'}}>✅</span>
            </div>
            <div>
              <p style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--text-gray)',
                margin: 0,
                fontWeight: '500'
              }}>Resolved Cases</p>
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

      {/* Analytics Charts Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 'var(--spacing-6)',
        marginBottom: 'var(--spacing-8)'
      }}>
        {/* Case Types Distribution */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-4)',
            color: 'var(--text-dark)'
          }}>Common Case Types</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart 
              data={analytics.caseTypes} 
              colors={chartColors}
              width={200}
              height={200}
            />
          </div>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            {analytics.caseTypes.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-2) 0',
                borderBottom: '1px solid var(--border-gray)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: chartColors[index % chartColors.length],
                    borderRadius: '2px',
                    marginRight: 'var(--spacing-2)'
                  }}></div>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.label}</span>
                </div>
                <span style={{ 
                  fontWeight: '600', 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-dark)'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Age Group Distribution */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-4)',
            color: 'var(--text-dark)'
          }}>Age Groups Affected</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BarChart 
              data={analytics.ageGroups} 
              colors={chartColors}
              width={280}
              height={200}
            />
          </div>
          <div style={{ marginTop: 'var(--spacing-4)', textAlign: 'center' }}>
            <p style={{ 
              fontSize: 'var(--font-size-sm)', 
              color: 'var(--text-gray)',
              margin: 0
            }}>
              Most affected: {analytics.ageGroups.length > 0 ? 
                analytics.ageGroups.reduce((max, group) => group.value > max.value ? group : max).label 
                : 'No data'}
            </p>
          </div>
        </div>

        {/* Priority Distribution */}
        <div style={{
          backgroundColor: 'var(--white)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--spacing-6)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h3 style={{
            fontSize: 'var(--font-size-lg)',
            fontWeight: '600',
            marginBottom: 'var(--spacing-4)',
            color: 'var(--text-dark)'
          }}>Case Priority</h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart 
              data={analytics.priorityDistribution} 
              colors={['#e74c3c', '#f39c12', '#27ae60']}
              width={180}
              height={180}
            />
          </div>
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            {analytics.priorityDistribution.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--spacing-2) 0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: ['#e74c3c', '#f39c12', '#27ae60'][index],
                    borderRadius: '2px',
                    marginRight: 'var(--spacing-2)'
                  }}></div>
                  <span style={{ fontSize: 'var(--font-size-sm)' }}>{item.label} Priority</span>
                </div>
                <span style={{ 
                  fontWeight: '600', 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--text-dark)'
                }}>
                  {item.value}
                </span>
              </div>
            ))}
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
                    {caseItem.caseId || 'No Case ID'} • {formatCaseTopic(caseItem.caseTopic)}
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