import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaEnvelope, FaArrowLeft, FaCheckCircle, FaExclamationCircle,
  FaShieldAlt, FaLock
} from 'react-icons/fa';
import { authAPI } from '../services/api';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please try again')), 10000)
      );
      
      const response = await Promise.race([
        authAPI.forgotPassword(email),
        timeoutPromise
      ]);
      
      // In development, show the reset link directly
      if (response.data.resetLink) {
        setSuccess(true);
        // Store reset link for display
        window.resetLinkData = {
          link: response.data.resetLink,
          token: response.data.token,
          expiresAt: response.data.expiresAt
        };
      } else {
        setSuccess(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      let errorMessage = 'Failed to send reset email. Please try again.';
      
      if (err.message === 'Request timeout - please try again') {
        errorMessage = 'Request timed out. The email may still be sent - please check your inbox.';
        // Still show success since the email might have been sent
        setSuccess(true);
      } else if (err.response?.data) {
        errorMessage = err.response.data.error || 
                       err.response.data.message || 
                       errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Only show error if it's not a timeout (timeout might mean email was sent)
      if (err.message !== 'Request timeout - please try again') {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container-login">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-logo">
            <div className="logo-icon">
              <FaLock />
            </div>
            <h1>Reset Password</h1>
          </div>
          <p className="brand-tagline">We'll help you regain access to your account</p>
          
          <div className="features-list">
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Secure password reset</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Email verification</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Quick & easy process</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <FaShieldAlt />
              <span>Secure Process</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forgot Password Form */}
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Forgot Password?</h2>
            <p>Enter your email address and we'll send you a link to reset your password</p>
          </div>

          {error && (
            <div className="auth-error-modern">
              <FaExclamationCircle className="error-icon" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="auth-success-modern">
              <FaCheckCircle className="success-icon" />
              <h3>Password Reset Link Generated</h3>
              {window.resetLinkData ? (
                <>
                  <p style={{ marginBottom: '15px' }}>
                    <strong>Development Mode:</strong> Use the link below to reset your password.
                  </p>
                  <div style={{ 
                    background: 'rgba(102, 126, 234, 0.1)', 
                    padding: '15px', 
                    borderRadius: '8px',
                    marginBottom: '15px',
                    wordBreak: 'break-all'
                  }}>
                    <strong>Reset Link:</strong>
                    <br />
                    <a 
                      href={window.resetLinkData.link} 
                      style={{ 
                        color: '#667eea', 
                        textDecoration: 'underline',
                        fontSize: '13px'
                      }}
                    >
                      {window.resetLinkData.link}
                    </a>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    Token: <code style={{ fontSize: '11px' }}>{window.resetLinkData.token}</code>
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
                    Expires: {new Date(window.resetLinkData.expiresAt).toLocaleString()}
                  </p>
                </>
              ) : (
                <>
                  <p>We've sent a password reset link to <strong>{email}</strong></p>
                  <p>Please check your inbox and click the link to reset your password. The link will expire in 1 hour.</p>
                  <p style={{ marginTop: '12px', fontSize: '13px' }}>
                    Didn't receive the email? Check your spam folder or try again.
                  </p>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-login">
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <FaEnvelope className="label-icon" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  className="form-input-modern"
                  required
                  autoFocus
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '8px', 
                  color: 'var(--text-secondary)',
                  fontSize: '13px'
                }}>
                  Enter the email address associated with your account
                </small>
              </div>

              <button 
                type="submit" 
                className="btn-login-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <FaArrowLeft className="btn-icon" style={{ transform: 'rotate(180deg)' }} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="auth-divider">
            <span>Remember your password?</span>
          </div>

          <Link to="/login" className="btn-register-link">
            <FaArrowLeft style={{ marginRight: '8px' }} />
            Back to Sign In
          </Link>

          <div className="auth-footer-login">
            <p>
              <FaShieldAlt className="footer-icon" />
              Your email is secure and will only be used for password reset
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

