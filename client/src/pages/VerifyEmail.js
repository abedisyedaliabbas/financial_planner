import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { FaCheckCircle, FaExclamationCircle, FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { authAPI } from '../services/api';
import './Auth.css';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Invalid verification link. Please request a new verification email.');
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authAPI.verifyEmail(token);
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { message: 'Email verified! You can now log in.' } });
      }, 3000);
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      let errorMessage = 'Failed to verify email. Please try again.';
      
      if (err.response?.data) {
        errorMessage = err.response.data.error || 
                       err.response.data.message || 
                       errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    // This would need the email, but we don't have it from the token
    // User should use the resend from login page
    navigate('/login');
  };

  return (
    <div className="auth-container-login">
      <div className="auth-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>
      <div className="auth-wrapper">
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Email Verification</h2>
            <p>Verifying your email address...</p>
          </div>

          {status === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div className="spinner" style={{ margin: '0 auto 20px', width: '50px', height: '50px' }}></div>
              <p>Please wait while we verify your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="auth-success-modern">
              <FaCheckCircle className="success-icon" />
              <h3>Email Verified Successfully! ✅</h3>
              <p>{message}</p>
              <p style={{ marginTop: '15px', fontSize: '14px' }}>Redirecting to login page...</p>
            </div>
          )}

          {status === 'error' && (
            <>
              <div className="auth-error-modern">
                <FaExclamationCircle className="error-icon" />
                <span>{error}</span>
              </div>
              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link to="/login" className="btn-login-primary" style={{ textDecoration: 'none', display: 'inline-block' }}>
                  <FaArrowLeft style={{ marginRight: '8px' }} />
                  Go to Login
                </Link>
              </div>
              <div style={{ marginTop: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
                  <FaEnvelope style={{ marginRight: '8px' }} />
                  Need a new verification email? Use the "Resend Verification" option on the login page.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


