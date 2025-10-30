// src/App.js
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Public Components
import Header from './components/public/Header';
import Footer from './components/public/Footer';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import GetHelp from './pages/public/GetHelp';
import Volunteer from './pages/public/Volunteer';
import Contact from './pages/public/Contact';

// Admin Pages
import Welcome from './pages/admin/Welcome';
import Register from './pages/admin/Register';
import Login from './pages/admin/Login';
import Users from './pages/admin/Users';
import Cases from './pages/admin/Cases';
import Reports from './pages/admin/Reports';

// Route Components
import AdminRoute from './components/routes/AdminRoute';
import CounsellorRoute from './components/routes/CounsellorRoute';
import StaffRoute from './components/routes/StaffRoute';
import DashboardRouter from './components/routes/DashboardRouter';
import PublicCaseTracker from './pages/PublicCaseTracker';

const PublicLayout = ({ children }) => (
  <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
    <Header />
    <main style={{flexGrow: 1}}>
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
          <Route path="/get-help" element={<PublicLayout><GetHelp /></PublicLayout>} />
          <Route path="/volunteer" element={<PublicLayout><Volunteer /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/track-case" element={<PublicCaseTracker />} />

          {/* Auth Routes */}
          <Route path="/admin/welcome" element={<Welcome />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/login" element={<Login />} />

          {/* Staff Routes */}
          <Route path="/admin/dashboard" element={<StaffRoute><DashboardRouter /></StaffRoute>} />

          {/* Admin-Only Routes */}
          <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />

          {/* Cases - All staff can access */}
          <Route path="/admin/cases" element={<StaffRoute><Cases /></StaffRoute>} />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/welcome" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;