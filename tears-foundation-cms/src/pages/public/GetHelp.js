// src/pages/public/GetHelp.js
import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const GetHelp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    urgency: 'medium'
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await addDoc(collection(db, 'helpRequests'), {
        ...formData,
        timestamp: new Date(),
        status: 'new'
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your request. Please try again or call our helpline.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
    return (
      <div style={{padding: 'var(--spacing-8) 0'}}>
        <div className="container">
          <div className="card">
            <div className="card-body text-center">
              <div className="alert alert-success">
                <h2>Thank You</h2>
                <p>We've received your request and will contact you shortly.</p>
              </div>
              <div className="alert alert-warning" style={{marginTop: 'var(--spacing-4)'}}>
                <p style={{fontWeight: '600', marginBottom: 'var(--spacing-2)'}}>Emergency Contact:</p>
                <p style={{fontSize: 'var(--font-size-xl)'}}>📞 0800 123 456 (24/7 Helpline)</p>
                <p>If you're in immediate danger, please contact emergency services at 10111</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: 'var(--spacing-8) 0'}}>
      <div className="container">
        <h1 style={{textAlign: 'center', marginBottom: 'var(--spacing-8)'}}>Get Help</h1>
        
        <div className="grid grid-cols-2" style={{gap: 'var(--spacing-8)'}}>
          <div>
            <div className="alert alert-error">
              <h3>Emergency Contact</h3>
              <p style={{fontSize: 'var(--font-size-lg)', fontWeight: '600'}}>24/7 Helpline: 0800 123 456</p>
              <p>If you're in immediate danger, please contact emergency services at 10111</p>
            </div>
            
            <div className="card" style={{marginTop: 'var(--spacing-4)'}}>
              <div className="card-body">
                <h3>What to Expect</h3>
                <ul style={{paddingLeft: 'var(--spacing-4)'}}>
                  <li>Confidential and compassionate support</li>
                  <li>Professional counselling services</li>
                  <li>Safety planning assistance</li>
                  <li>Referrals to additional resources</li>
                  <li>Ongoing support throughout your journey</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <h3>Request Help</h3>
              <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-input"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-input"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Urgency Level</label>
                  <select
                    name="urgency"
                    className="form-select"
                    value={formData.urgency}
                    onChange={handleChange}
                  >
                    <option value="low">Low - I need information</option>
                    <option value="medium">Medium - I'd like to schedule counselling</option>
                    <option value="high">High - I need urgent support</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">How can we help you? *</label>
                  <textarea
                    name="message"
                    className="form-textarea"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Please describe your situation and how we can assist you..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                
                <p style={{fontSize: 'var(--font-size-sm)', color: 'var(--secondary-gray)', textAlign: 'center'}}>
                  All information is kept strictly confidential in compliance with POPIA.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetHelp;