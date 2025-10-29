// src/pages/public/Contact.js
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{padding: 'var(--spacing-8) 0'}}>
      <div className="container">
        <h1 style={{textAlign: 'center', marginBottom: 'var(--spacing-8)'}}>Contact Us</h1>
        
        <div className="grid grid-cols-2" style={{gap: 'var(--spacing-8)'}}>
          <div className="card">
            <div className="card-body">
              <h3>Get In Touch</h3>
              <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
                <div className="form-group">
                  <label className="form-label">Name</label>
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
                  <label className="form-label">Email</label>
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
                  <label className="form-label">Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    className="form-input"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea 
                    name="message"
                    className="form-textarea"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">Send Message</button>
              </form>
            </div>
          </div>
          
          <div>
            <div className="card">
              <div className="card-body">
                <h3>Contact Information</h3>
                <div style={{display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)'}}>
                  <div>
                    <h4>Emergency Helpline</h4>
                    <p style={{fontSize: 'var(--font-size-xl)', fontWeight: '600', color: 'var(--error-red)'}}>0800 123 456</p>
                    <p>24/7 Confidential Support</p>
                  </div>
                  
                  <div>
                    <h4>Email</h4>
                    <p>info@tearsfoundation.org</p>
                  </div>
                  
                  <div>
                    <h4>Office Hours</h4>
                    <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                    <p>Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="card" style={{marginTop: 'var(--spacing-4)'}}>
              <div className="card-body">
                <h3>Emergency Services</h3>
                <p>If you are in immediate danger, please call:</p>
                <p style={{fontWeight: '600'}}>Police: 10111</p>
                <p style={{fontWeight: '600'}}>Ambulance: 10177</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;