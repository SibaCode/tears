// src/pages/public/Home.js
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Welcome to TEARS Foundation</h1>
          <p className="hero-subtitle">
            Providing compassionate support and comprehensive services for survivors of domestic violence and sexual assault.
          </p>
          <div style={{display: 'flex', gap: 'var(--spacing-4)', justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/get-help" className="btn btn-primary" style={{fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)'}}>
              Get Help Now
            </Link>
            <Link to="/contact" className="btn btn-outline" style={{fontSize: 'var(--font-size-lg)', padding: 'var(--spacing-4) var(--spacing-8)', borderColor: 'var(--white)', color: 'var(--white)'}}>
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section style={{padding: 'var(--spacing-16) 0', backgroundColor: 'var(--white)'}}>
        <div className="container">
          <h2 style={{textAlign: 'center', marginBottom: 'var(--spacing-12)'}}>How We Help</h2>
          <div className="grid grid-cols-3" style={{gap: 'var(--spacing-8)'}}>
            <div style={{textAlign: 'center', padding: 'var(--spacing-6)'}}>
              <div style={{backgroundColor: 'var(--primary-blue-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-4)'}}>
                <span style={{fontSize: 'var(--font-size-2xl)'}}>📞</span>
              </div>
              <h3 style={{marginBottom: 'var(--spacing-4)'}}>24/7 Helpline</h3>
              <p style={{color: 'var(--secondary-gray)'}}>
                Immediate confidential support from trained professionals anytime, day or night.
              </p>
            </div>
            <div style={{textAlign: 'center', padding: 'var(--spacing-6)'}}>
              <div style={{backgroundColor: 'var(--primary-blue-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-4)'}}>
                <span style={{fontSize: 'var(--font-size-2xl)'}}>👥</span>
              </div>
              <h3 style={{marginBottom: 'var(--spacing-4)'}}>Professional Counselling</h3>
              <p style={{color: 'var(--secondary-gray)'}}>
                One-on-one counselling sessions with qualified and compassionate therapists.
              </p>
            </div>
            <div style={{textAlign: 'center', padding: 'var(--spacing-6)'}}>
              <div style={{backgroundColor: 'var(--primary-blue-light)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--spacing-4)'}}>
                <span style={{fontSize: 'var(--font-size-2xl)'}}>🛡️</span>
              </div>
              <h3 style={{marginBottom: 'var(--spacing-4)'}}>Safe & Confidential</h3>
              <p style={{color: 'var(--secondary-gray)'}}>
                Your privacy and safety are our highest priorities in all our services.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Banner */}
      <section style={{padding: 'var(--spacing-8) 0', backgroundColor: 'var(--error-red)', color: 'var(--white)'}}>
        <div className="container">
          <div style={{textAlign: 'center'}}>
            <h3 style={{marginBottom: 'var(--spacing-2)'}}>In Emergency? Need Immediate Help?</h3>
            <p style={{fontSize: 'var(--font-size-xl)', fontWeight: '600', marginBottom: 'var(--spacing-4)'}}>
              24/7 Crisis Line: 0800 123 456
            </p>
            <p>If you're in immediate danger, call emergency services at 10111</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;