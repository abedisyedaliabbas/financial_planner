import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        color: 'white'
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user needs to complete profile (missing country or currency)
  // Only check if not already on the complete-profile page
  const needsProfileCompletion = !user.country || !user.default_currency;
  const isCompleteProfilePage = window.location.pathname === '/complete-profile';
  
  if (needsProfileCompletion && !isCompleteProfilePage) {
    return <Navigate to="/complete-profile" replace />;
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default AuthGuard;


