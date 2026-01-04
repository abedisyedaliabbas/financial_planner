import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  FaLock, FaCheckCircle, FaExclamationCircle, FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa';
import { authAPI } from '../services/api';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authAPI.resetPassword(token, password);
      setSuccess(true);
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Reset password error:', err);
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (err.response?.data) {
        errorMessage = err.response.data.error || 
                       err.response.data.message || 
                       errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="auth-container-login">
        <div className="auth-background">
          <div className="bg-shape bg-shape-1"></div>
          <div className="bg-shape bg-shape-2"></div>
          <div className="bg-shape bg-shape-3"></div>
        </div>
        <div className="auth-wrapper">
          <div className="auth-card-login">
            <div className="auth-error-modern">
              <FaExclamationCircle className="error-icon" />
              <span>Invalid reset link. Please request a new password reset.</span>
            </div>
            <Link to="/forgot-password" className="btn-login-primary" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <p className="brand-tagline">Create a new secure password for your account</p>
          
          <div className="features-list">
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Minimum 8 characters</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Secure & encrypted</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <FaShieldAlt />
              <span>Secure Process</span>
            </div>
          </div>
        </div>

        {/* Right Side - Reset Password Form */}
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Create New Password</h2>
            <p>Enter your new password below</p>
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
              <h3>Password Reset Successful!</h3>
              <p>Your password has been reset successfully.</p>
              <p>Redirecting to login page...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form-login">
              <div className="form-group-modern">
                <label className="form-label-modern">
                  <FaLock className="label-icon" />
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password (min 8 characters)"
                  className="form-input-modern"
                  required
                  minLength={8}
                  autoFocus
                />
                <small style={{ 
                  display: 'block', 
                  marginTop: '8px', 
                  color: 'var(--text-secondary)',
                  fontSize: '13px'
                }}>
                  Must be at least 8 characters long
                </small>
              </div>

              <div className="form-group-modern">
                <label className="form-label-modern">
                  <FaLock className="label-icon" />
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  className="form-input-modern"
                  required
                  minLength={8}
                />
              </div>

              <button 
                type="submit" 
                className="btn-login-primary" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <FaCheckCircle className="btn-icon" />
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
              Your password is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;


