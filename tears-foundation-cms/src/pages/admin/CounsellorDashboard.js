// src/pages/admin/CounsellorDashboard.js - SIMPLIFIED VERSION
import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const CounsellorDashboard = () => {
  const [myCases, setMyCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser, userData } = useAuth();

  // Use getDocs instead of onSnapshot to avoid real-time listener issues
  useEffect(() => {
    const loadMyCases = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'cases'));
        const allCases = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter cases assigned to this counsellor manually
        const myAssignedCases = allCases.filter(caseItem => 
          caseItem.assignedCounsellorId === currentUser.uid
        );
        
        setMyCases(myAssignedCases);
      } catch (error) {
        console.error('Error loading cases:', error);
      }
    };

    loadMyCases();
  }, [currentUser.uid]);

  const handleAddNote = async (caseId) => {
    if (!noteText.trim()) return;

    setLoading(true);
    try {
      const caseRef = doc(db, 'cases', caseId);
      const caseDoc = myCases.find(c => c.id === caseId);
      
      const updatedNotes = [
        ...(caseDoc.notes || []),
        {
          text: noteText,
          author: userData?.name || currentUser.email,
          timestamp: new Date(),
          type: 'progress_note'
        }
      ];

      await updateDoc(caseRef, {
        notes: updatedNotes,
        updatedAt: new Date()
      });

      // Reload cases after update
      const snapshot = await getDocs(collection(db, 'cases'));
      const allCases = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      const myAssignedCases = allCases.filter(caseItem => 
        caseItem.assignedCounsellorId === currentUser.uid
      );
      setMyCases(myAssignedCases);

      setNoteText('');
      alert('Note added successfully!');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (caseId, newStatus) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'cases', caseId), {
        status: newStatus,
        updatedAt: new Date()
      });
      
      // Update local state
      setMyCases(prev => prev.map(caseItem => 
        caseItem.id === caseId 
          ? { ...caseItem, status: newStatus }
          : caseItem
      ));
      
      alert('Case status updated!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setLoading(false);
    }
  };

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
      <div style={{marginBottom: 'var(--spacing-6)'}}>
        <h1>My Cases2</h1>
        <p>Welcome back, {userData?.name || 'Counsellor'}</p>
      </div>

      {/* Cases List */}
      <div className="card">
        <div className="card-header">
          <h2>My Assigned Cases ({myCases.length})</h2>
        </div>
        <div className="card-body">
          {myCases.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--secondary-gray)'}}>
              No cases assigned to you yet.
            </p>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
              {myCases.map((caseItem) => (
                <div key={caseItem.id} className="card">
                  <div className="card-body">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                      <div>
                        <h4>{caseItem.survivorName}</h4>
                        <p style={{color: 'var(--secondary-gray)'}}>Case ID: {caseItem.caseId}</p>
                        <p><strong>Contact:</strong> {caseItem.contactInfo}</p>
                        <p><strong>Description:</strong> {caseItem.caseDescription}</p>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)', alignItems: 'end'}}>
                        {getUrgencyBadge(caseItem.urgency)}
                        {getStatusBadge(caseItem.status)}
                        <select
                          value={caseItem.status}
                          onChange={(e) => handleUpdateStatus(caseItem.id, e.target.value)}
                          className="form-select"
                          disabled={loading}
                        >
                          <option value="new">New</option>
                          <option value="inProgress">In Progress</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>
                    </div>

                    {/* Notes Section */}
                    <div style={{marginTop: 'var(--spacing-4)'}}>
                      <h5>Progress Notes</h5>
                      <textarea
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a progress note..."
                        rows="2"
                        className="form-textarea"
                        style={{width: '100%', marginBottom: 'var(--spacing-2)'}}
                      />
                      <button
                        onClick={() => handleAddNote(caseItem.id)}
                        disabled={loading || !noteText.trim()}
                        className="btn btn-primary"
                      >
                        {loading ? 'Adding...' : 'Add Note'}
                      </button>

                      {/* Existing Notes */}
                      <div style={{marginTop: 'var(--spacing-3)'}}>
                        {(caseItem.notes || []).map((note, index) => (
                          <div key={index} style={{
                            padding: 'var(--spacing-2)',
                            backgroundColor: 'var(--secondary-gray-light)',
                            borderRadius: 'var(--radius)',
                            marginBottom: 'var(--spacing-1)'
                          }}>
                            <small style={{color: 'var(--secondary-gray)'}}>
                              {note.author} - {new Date(note.timestamp?.seconds * 1000).toLocaleString()}
                            </small>
                            <div>{note.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboard;