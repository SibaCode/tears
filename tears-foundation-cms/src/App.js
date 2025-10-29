// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import Dashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';

// Admin Components
import AdminSidebar from './components/admin/AdminSidebar';

const PublicLayout = ({ children }) => (
  <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
    <Header />
    <main style={{flexGrow: 1}}>
      {children}
    </main>
    <Footer />
  </div>
);

const AdminLayout = ({ children }) => (
  <div style={{display: 'flex'}}>
    <AdminSidebar />
    <div style={{
      marginLeft: '250px',
      flex: 1,
      minHeight: '100vh',
      backgroundColor: 'var(--secondary-gray-light)'
    }}>
      {children}
    </div>
  </div>
);

const AdminRoute = ({ children }) => {
  const { currentUser, userRole } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/admin/login" />;
  }
  
  if (userRole !== 'admin' && userRole !== 'counsellor') {
    return <Navigate to="/" />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          <Route path="/about" element={
            <PublicLayout>
              <About />
            </PublicLayout>
          } />
          <Route path="/services" element={
            <PublicLayout>
              <Services />
            </PublicLayout>
          } />
          <Route path="/get-help" element={
            <PublicLayout>
              <GetHelp />
            </PublicLayout>
          } />
          <Route path="/volunteer" element={
            <PublicLayout>
              <Volunteer />
            </PublicLayout>
          } />
          <Route path="/contact" element={
            <PublicLayout>
              <Contact />
            </PublicLayout>
          } />

          {/* Admin Routes */}
          <Route path="/admin/welcome" element={<Welcome />} />
          <Route path="/admin/register" element={<Register />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />

          {/* Redirects */}
          <Route path="/admin" element={<Navigate to="/admin/welcome" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;