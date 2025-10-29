// src/components/public/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>TEARS Foundation</h3>
            <p>Providing support and care for survivors.</p>
          </div>
          <div className="footer-section">
            <h4>Emergency Contacts</h4>
            <p>24/7 Helpline: <strong>0800 123 456</strong></p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 TEARS Foundation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;