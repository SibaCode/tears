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

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      <div style={{marginBottom: 'var(--spacing-6)'}}>
        <h1 style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--secondary-gray-dark)', marginBottom: 'var(--spacing-2)'}}>
          Dashboard
        </h1>
        <p style={{color: 'var(--secondary-gray)'}}>
          Welcome to TEARS Foundation Case Management System
        </p>
      </div>
      
      {/* Statistics Cards */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)'}}>
        <div className="card">
          <div className="card-body" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Total Cases</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--primary-blue)'}}>{stats.totalCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>New Cases</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>{stats.newCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>In Progress</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--warning-yellow)'}}>{stats.inProgressCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body" style={{textAlign: 'center'}}>
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Closed</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>{stats.closedCases}</p>
          </div>
        </div>
      </div>
{/* Quick Actions */}
<div className="card">
  <div className="card-header">
    <h2>Quick Actions</h2>
  </div>
  <div className="card-body">
    <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
      <Link 
        to="/admin/cases?new=true"
        className="btn btn-primary"
        style={{textAlign: 'center'}}
      >
        + Create New Case
      </Link>
      
      {userRole === 'admin' && (
        <Link 
          to="/admin/users"
          className="btn btn-secondary"
          style={{textAlign: 'center'}}
        >
          👥 Manage Users
        </Link>
      )}
      
      <Link 
        to="/get-help"
        className="btn btn-success"
        style={{textAlign: 'center'}}
      >
        🌐 View Public Site
      </Link>
    </div>
  </div>
</div>
      {/* Help Requests Alert */}
      {userRole === 'admin' && stats.newHelpRequests > 0 && (
        <div className="alert alert-warning" style={{marginBottom: 'var(--spacing-6)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h3 style={{marginBottom: 'var(--spacing-1)'}}>New Help Requests</h3>
              <p>{stats.newHelpRequests} new requests need attention</p>
            </div>
            <Link 
              to="/admin/cases"
              className="btn btn-primary"
            >
              View Requests
            </Link>
          </div>
        </div>
      )}

      {/* Recent Cases */}
      <div className="card">
        <div className="card-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h2>Recent Cases</h2>
          <Link 
            to="/admin/cases"
            style={{color: 'var(--primary-blue)', fontWeight: '500', textDecoration: 'none'}}
          >
            View All →
          </Link>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Case ID</th>
                  <th className="table-header-cell">Survivor</th>
                  <th className="table-header-cell">Status</th>
                  <th className="table-header-cell">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="table-cell">{caseItem.caseId || 'N/A'}</td>
                    <td className="table-cell">{caseItem.survivorName || 'Unnamed'}</td>
                    <td className="table-cell">
                      <span className={`badge ${
                        caseItem.status === 'new' ? 'badge-new' :
                        caseItem.status === 'inProgress' ? 'badge-in-progress' :
                        'badge-closed'
                      }`}>
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      {caseItem.updatedAt ? new Date(caseItem.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {cases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="table-cell" style={{textAlign: 'center'}}>
                      No cases found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;