// src/pages/admin/CounsellorDashboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import { getCounsellorWorkload } from '../../utils/counsellorMatcher';

const CounsellorDashboard = () => {
  const [myCases, setMyCases] = useState([]);
  const [workload, setWorkload] = useState({ activeCases: 0, closedCases: 0, totalCases: 0 });
  const { currentUser, userData } = useAuth();

  useEffect(() => {
    // Load counsellor's cases
    const casesQuery = query(
      collection(db, 'cases'),
      where('assignedCounsellorId', '==', currentUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(casesQuery, (snapshot) => {
      const casesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMyCases(casesData);
    });

    // Load workload statistics
    const loadWorkload = async () => {
      const stats = await getCounsellorWorkload(db, currentUser.uid);
      setWorkload(stats);
    };

    loadWorkload();

    return unsubscribe;
  }, [currentUser.uid]);

  const getUrgencyBadge = (urgency) => {
    const urgencyConfig = {
      low: { class: 'badge-low', label: 'Low' },
      medium: { class: 'badge-medium', label: 'Medium' },
      high: { class: 'badge-high', label: 'High' }
    };
    const config = urgencyConfig[urgency] || urgencyConfig.medium;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  return (
    <div style={{padding: 'var(--spacing-6)'}}>
      <div style={{marginBottom: 'var(--spacing-6)'}}>
        <h1>My Casesw</h1>
        <p>Welcome back, {userData?.name}</p>
      </div>

      {/* Workload Statistics */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)'}}>
        <div className="card">
          <div className="card-body text-center">
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Active Cases</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--primary-blue)'}}>{workload.activeCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Closed Cases</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>{workload.closedCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Total Cases</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--warning-yellow)'}}>{workload.totalCases}</p>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <h3 style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginBottom: 'var(--spacing-2)'}}>Available Capacity</h3>
            <p style={{fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--success-green)'}}>
              {userData?.maxCases ? userData.maxCases - workload.activeCases : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* My Cases List */}
      <div className="card">
        <div className="card-header">
          <h2>My Assigned Cases</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th className="table-header-cell">Case ID</th>
                  <th className="table-header-cell">Survivor</th>
                  <th className="table-header-cell">Urgency</th>
                  <th className="table-header-cell">Specialization</th>
                  <th className="table-header-cell">Last Updated</th>
                  <th className="table-header-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {myCases.map((caseItem) => (
                  <tr key={caseItem.id}>
                    <td className="table-cell" style={{fontFamily: 'monospace', fontSize: 'var(--font-size-sm)'}}>
                      {caseItem.caseId}
                    </td>
                    <td className="table-cell">
                      <strong>{caseItem.survivorName}</strong>
                      {caseItem.survivorAge && (
                        <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
                          Age: {caseItem.survivorAge}
                        </div>
                      )}
                    </td>
                    <td className="table-cell">
                      {getUrgencyBadge(caseItem.urgency)}
                    </td>
                    <td className="table-cell">
                      {caseItem.specializationNeeded || 'General'}
                    </td>
                    <td className="table-cell">
                      {caseItem.updatedAt ? new Date(caseItem.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="table-cell">
                      <span className={`badge ${
                        caseItem.status === 'new' ? 'badge-new' :
                        caseItem.status === 'inProgress' ? 'badge-in-progress' :
                        'badge-closed'
                      }`}>
                        {caseItem.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myCases.length === 0 && (
                  <tr>
                    <td colSpan="6" className="table-cell" style={{textAlign: 'center'}}>
                      No cases assigned to you yet.
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

export default CounsellorDashboard;