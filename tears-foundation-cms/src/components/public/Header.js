// src/components/public/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            TEARS Foundation
          </Link>
          
          <nav className="navbar-nav" style={{display: 'flex', gap: 'var(--spacing-6)', alignItems: 'center'}}>
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/get-help" className="nav-link">Get Help</Link>
            <Link to="/volunteer" className="nav-link">Volunteer</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
                    <li>
              <Link 
                to="/track-case" 
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: '600',
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  padding: 'var(--spacing-2) var(--spacing-4)',
                  borderRadius: 'var(--radius)',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.2)'}
              >
                📋 Track Your Case
              </Link>
            </li>
            <Link to="/admin/login" className="btn btn-primary">
              Staff Login
            </Link>
             <Link to="/admin/register" className="btn btn-secondary" style={{marginLeft: 'var(--spacing-2)'}}>
              Register
            </Link> 
            <Link to="/admin" className="btn btn-primary">
              Staff Portal
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;