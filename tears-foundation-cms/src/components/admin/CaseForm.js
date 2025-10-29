// src/components/admin/CaseForm.js
import React, { useState, useEffect } from 'react';
import { doc, setDoc, collection, addDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';

const CaseForm = ({ caseData, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    survivorName: '',
    survivorAge: '',
    contactInfo: '',
    caseDetails: '',
    status: 'new',
    urgency: 'medium',
    assignedCounsellorId: ''
  });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { userRole, currentUser } = useAuth();

  useEffect(() => {
    if (caseData) {
      setFormData(caseData);
    }
  }, [caseData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fileUrls = [];
      
      // Upload files
      for (const file of files) {
        const fileRef = ref(storage, `cases/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        fileUrls.push({ name: file.name, url });
      }

      const caseDataToSave = {
        ...formData,
        documents: [...(formData.documents || []), ...fileUrls],
        updatedAt: new Date(),
        updatedBy: currentUser.uid
      };

      if (caseData?.id) {
        // Update existing case
        await updateDoc(doc(db, 'cases', caseData.id), caseDataToSave);
      } else {
        // Create new case
        caseDataToSave.createdAt = new Date();
        caseDataToSave.createdBy = currentUser.uid;
        caseDataToSave.caseId = `CASE-${Date.now()}`;
        
        await addDoc(collection(db, 'cases'), caseDataToSave);
      }

      onSave();
    } catch (error) {
      console.error('Error saving case:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">
        {caseData ? 'Edit Case' : 'Create New Case'}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Survivor Name</label>
          <input
            type="text"
            value={formData.survivorName}
            onChange={(e) => setFormData({...formData, survivorName: e.target.value})}
            className="w-full p-3 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Age</label>
          <input
            type="number"
            value={formData.survivorAge}
            onChange={(e) => setFormData({...formData, survivorAge: e.target.value})}
            className="w-full p-3 border rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Contact Information</label>
        <textarea
          value={formData.contactInfo}
          onChange={(e) => setFormData({...formData, contactInfo: e.target.value})}
          rows="3"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Case Details</label>
        <textarea
          value={formData.caseDetails}
          onChange={(e) => setFormData({...formData, caseDetails: e.target.value})}
          rows="5"
          className="w-full p-3 border rounded-lg"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="w-full p-3 border rounded-lg"
          >
            <option value="new">New</option>
            <option value="inProgress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Urgency</label>
          <select
            value={formData.urgency}
            onChange={(e) => setFormData({...formData, urgency: e.target.value})}
            className="w-full p-3 border rounded-lg"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {userRole === 'admin' && (
          <div>
            <label className="block text-sm font-medium mb-2">Assign Counsellor</label>
            <input
              type="text"
              value={formData.assignedCounsellorId}
              onChange={(e) => setFormData({...formData, assignedCounsellorId: e.target.value})}
              className="w-full p-3 border rounded-lg"
              placeholder="Counsellor User ID"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Supporting Documents</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full p-3 border rounded-lg"
        />
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? 'Saving...' : 'Save Case'}
        </button>
      </div>
    </form>
  );
};

export default CaseForm;