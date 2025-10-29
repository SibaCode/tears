import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy  , deleteDoc, doc} from 'firebase/firestore';
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
          // Counsellors only see their assigned cases
          casesQuery = query(
            collection(db, 'cases'),
            where('assignedCounsellorId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
          );
        } else {
          // Admins and Super Admins see all cases
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      new: { class: 'badge-new', label: 'New' },
      inProgress: { class: 'badge-in-progress', label: 'In Progress' },
      closed: { class: 'badge-closed', label: 'Closed' }
    };
    const config = statusConfig[status] || statusConfig.new;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

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
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)'}}>
        <h1>
          {userRole === 'counsellor' ? 'My Cases' : 'Case Management1'}
          <span style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', marginLeft: 'var(--spacing-2)'}}>
            ({cases.length} cases)
          </span>
        </h1>
        
        {/* Only show "New Case" button for admins */}
        {(userRole === 'admin' || userRole === 'superadmin') && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + New Case
          </button>
        )}
      </div>

      {showForm || editingCase ? (
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
) : (
        <>
          {/* Filters */}
          <div className="card" style={{marginBottom: 'var(--spacing-6)'}}>
            <div className="card-body">
              <div style={{display: 'flex', gap: 'var(--spacing-4)', alignItems: 'center'}}>
                <span style={{fontWeight: '600'}}>Filter by Status:</span>
                <select 
                  className="form-select"
                  style={{width: 'auto'}}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Cases</option>
                  <option value="new">New</option>
                  <option value="inProgress">In Progress</option>
                  <option value="closed">Closed</option>
                </select>
                <span style={{color: 'var(--secondary-gray)'}}>
                  Showing {filteredCases.length} of {cases.length} cases
                </span>
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="card">
            <div className="card-body">
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="table-header-cell">Case ID</th>
                      <th className="table-header-cell">Survivor</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Urgency</th>
                      <th className="table-header-cell">Last Updated</th>
                      <th className="table-header-cell">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id}>
                        <td className="table-cell" style={{fontFamily: 'monospace', fontSize: 'var(--font-size-sm)'}}>
                          {caseItem.caseId}
                        </td>
                        <td className="table-cell">
                          <div>
                            <strong>{caseItem.survivorName}</strong>
                            {caseItem.survivorAge && (
                              <div style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)'}}>
                                Age: {caseItem.survivorAge}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-cell">
                          {getStatusBadge(caseItem.status)}
                        </td>
                        <td className="table-cell">
                          {getUrgencyBadge(caseItem.urgency)}
                        </td>
                        <td className="table-cell">
                          {caseItem.updatedAt ? new Date(caseItem.updatedAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="table-cell">
                          <div style={{display: 'flex', gap: 'var(--spacing-2)'}}>
                            <button
                              className="btn btn-secondary"
                              style={{padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)'}}
                              onClick={() => setEditingCase(caseItem)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-danger"
                              style={{padding: 'var(--spacing-1) var(--spacing-2)', fontSize: 'var(--font-size-sm)'}}
                              onClick={() => handleDeleteCase(caseItem.id, caseItem.survivorName)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredCases.length === 0 && (
                      <tr>
                        <td colSpan="6" className="table-cell" style={{textAlign: 'center'}}>
                          {cases.length === 0 ? 'No cases found' : 'No cases match the selected filter'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cases;