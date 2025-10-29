// src/pages/public/Volunteer.js
import React from 'react';

const Volunteer = () => {
  return (
    <div style={{padding: 'var(--spacing-8) 0'}}>
      <div className="container">
        <div className="card">
          <div className="card-body">
            <h1>Volunteer With Us</h1>
            <p>Join our team of dedicated volunteers making a difference in survivors' lives.</p>
            
            <div style={{marginTop: 'var(--spacing-6)'}}>
              <h3>Opportunities Available:</h3>
              <ul style={{paddingLeft: 'var(--spacing-6)', marginTop: 'var(--spacing-4)'}}>
                <li>Crisis Line Support</li>
                <li>Administrative Assistance</li>
                <li>Community Outreach</li>
                <li>Fundraising Events</li>
                <li>Professional Services (Legal, Medical)</li>
              </ul>
            </div>
            
            <div style={{marginTop: 'var(--spacing-6)'}}>
              <button className="btn btn-primary">Apply to Volunteer</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Volunteer;