import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { 
  FaLock, FaEnvelope, FaArrowRight, FaChartLine, FaShieldAlt, 
  FaCreditCard, FaPiggyBank, FaCheckCircle, FaStar
} from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [resendingVerification, setResendingVerification] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const googleButtonRef = useRef(null);
  
  // Check for messages from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state.email) {
        setEmail(location.state.email);
      }
    }
  }, [location]);

  // Initialize Google Sign-In
  useEffect(() => {
    const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    console.log('🔍 Google Sign-In Debug:', {
      hasClientId: !!googleClientId,
      clientId: googleClientId ? googleClientId.substring(0, 20) + '...' : 'NOT SET',
      hasGoogleScript: typeof window.google !== 'undefined',
      hasButtonRef: !!googleButtonRef.current,
      envVar: process.env.REACT_APP_GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET'
    });
    
    if (!googleClientId) {
      console.error('❌ REACT_APP_GOOGLE_CLIENT_ID is not set! Restart the frontend server after creating .env.local');
      return;
    }
    
    const initGoogleSignIn = () => {
      if (window.google && googleButtonRef.current && googleClientId) {
        try {
          console.log('✅ Initializing Google Sign-In button...');
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleGoogleSignIn,
          });

          window.google.accounts.id.renderButton(
            googleButtonRef.current,
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'signin_with',
              locale: 'en'
            }
          );
          console.log('✅ Google Sign-In button rendered successfully');
        } catch (error) {
          console.error('❌ Error initializing Google Sign-In:', error);
        }
      } else {
        console.warn('⚠️ Google Sign-In not ready:', {
          hasGoogle: !!window.google,
          hasRef: !!googleButtonRef.current,
          hasClientId: !!googleClientId
        });
      }
    };

    // Wait for Google script to load
    if (window.google && window.google.accounts) {
      initGoogleSignIn();
    } else {
      // Check if script is loading
      let attempts = 0;
      const maxAttempts = 100; // 10 seconds
      
      const checkGoogle = setInterval(() => {
        attempts++;
        if (window.google && window.google.accounts && window.google.accounts.id) {
          clearInterval(checkGoogle);
          console.log('✅ Google script loaded after', attempts * 100, 'ms');
          initGoogleSignIn();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkGoogle);
          console.error('❌ Google script failed to load after 10 seconds. Check network tab.');
        }
      }, 100);
    }
  }, []);

  const handleGoogleSignIn = async (response) => {
    setGoogleLoading(true);
    setError('');
    
    try {
      const result = await googleSignIn(response.credential);
      // Check if profile completion is needed
      if (result?.needsProfileCompletion) {
        navigate('/complete-profile');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      let errorMessage = 'Google sign-in failed. Please try again.';
      if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      // Check if it's a network error
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the server is running and try again.');
        return;
      }
      
      // Check if email verification is required
      if (err.response?.data?.requiresVerification) {
        setError(err.response.data.message || 'Please verify your email address before logging in.');
        setSuccessMessage('A new verification email has been sent to your inbox.');
        return;
      }
      
      // Get detailed error message
      let errorMessage = 'Login failed. Please try again.';
      
      if (err.response?.data) {
        errorMessage = err.response.data.error || 
                       err.response.data.message || 
                       errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show detailed error in console for debugging
      console.error('Full error object:', err);
      console.error('Error response data:', err.response?.data);
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setResendingVerification(true);
    setError('');
    setSuccessMessage('');

    try {
      await authAPI.resendVerification(email);
      setSuccessMessage('Verification email sent! Please check your inbox.');
    } catch (err) {
      let errorMessage = 'Failed to send verification email. Please try again.';
      if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setResendingVerification(false);
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
        {/* Left Side - Branding & Features */}
        <div className="auth-branding">
          <div className="brand-logo">
            <div className="logo-icon">
              <FaChartLine />
            </div>
            <h1>Financial Planner</h1>
          </div>
          <p className="brand-tagline">Take control of your finances with powerful insights</p>
          
          <div className="features-list">
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Track expenses & income</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Multi-currency support</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Visual analytics & charts</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Secure & encrypted</span>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <FaShieldAlt />
              <span>Bank-level Security</span>
            </div>
            <div className="badge">
              <FaStar />
              <span>Free Forever</span>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Welcome Back!</h2>
            <p>Sign in to access your financial dashboard</p>
          </div>

          {successMessage && (
            <div className="auth-success-modern" style={{ marginBottom: '20px' }}>
              <FaCheckCircle className="success-icon" />
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="auth-error-modern">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
              {(error.includes('verify') || error.includes('verification')) && email && (
                <button
                  onClick={handleResendVerification}
                  disabled={resendingVerification}
                  style={{
                    marginTop: '10px',
                    padding: '10px 16px',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: resendingVerification ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    width: '100%',
                    fontWeight: '500',
                    opacity: resendingVerification ? 0.7 : 1
                  }}
                >
                  {resendingVerification ? 'Sending...' : '📧 Resend Verification Email'}
                </button>
              )}
            </div>
          )}

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
                placeholder="Enter your email"
                className="form-input-modern"
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label className="form-label-modern">
                  <FaLock className="label-icon" />
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  style={{ 
                    fontSize: '13px', 
                    color: '#667eea', 
                    textDecoration: 'none',
                    fontWeight: '500'
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input-modern"
                required
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
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          {/* Always show the divider and button container - Google will render button if available */}
          <div className="auth-divider">
            <span>OR</span>
          </div>
          
          {process.env.REACT_APP_GOOGLE_CLIENT_ID ? (
            <div 
              ref={googleButtonRef}
              id="google-signin-button"
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                marginBottom: '20px',
                minHeight: '40px',
                opacity: googleLoading ? 0.6 : 1,
                pointerEvents: googleLoading ? 'none' : 'auto'
              }}
            />
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '10px', 
              color: '#666', 
              fontSize: '13px',
              marginBottom: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              ⚠️ Google Sign-In not configured. Restart frontend server after setting REACT_APP_GOOGLE_CLIENT_ID in .env.local
            </div>
          )}
          
          {googleLoading && (
            <div style={{ textAlign: 'center', marginBottom: '20px', color: '#667eea' }}>
              <span className="spinner" style={{ display: 'inline-block', marginRight: '8px' }}></span>
              Signing in with Google...
            </div>
          )}

          <div className="auth-divider">
            <span>New to Financial Planner?</span>
          </div>

          <Link to="/register" className="btn-register-link">
            Create a free account
          </Link>

          <div className="auth-footer-login">
            <p>
              <FaShieldAlt className="footer-icon" />
              Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

