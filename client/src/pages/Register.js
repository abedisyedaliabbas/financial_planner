import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaLock, FaEnvelope, FaUser, FaArrowRight, FaGlobe, FaDollarSign, FaPhone,
  FaChartLine, FaCheckCircle, FaShieldAlt, FaStar, FaCreditCard, FaPiggyBank,
  FaChartBar, FaBell, FaDatabase, FaInfinity, FaRocket
} from 'react-icons/fa';
import { COUNTRIES, CURRENCIES } from '../utils/banksData';
import { getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    default_currency: 'USD',
    mobile_number: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Auto-set currency when country changes
    if (name === 'country' && value) {
      const currency = CURRENCIES[value] || 'USD';
      setFormData(prev => ({ ...prev, default_currency: currency }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || formData.name.trim() === '') {
      setError('Name is required');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!formData.country) {
      setError('Please select your country');
      return;
    }

    if (!formData.default_currency) {
      setError('Please select your default currency');
      return;
    }

    setLoading(true);

    try {
      const response = await register(formData.email, formData.password, formData.name, formData.country, formData.default_currency, formData.mobile_number);
      
      // Check if email verification is required
      if (response?.requiresVerification || response?.data?.requiresVerification) {
        let message = 'Registration successful! Please check your email to verify your account before logging in.';
        
        // Check if there was an email error
        if (response?.emailError || response?.data?.emailError) {
          message = 'Registration successful! However, we could not send the verification email. Please use "Resend Verification" on the login page or contact support.';
          console.error('Email sending failed:', response?.emailError || response?.data?.emailError);
        }
        
        // In development, show the verification link
        if (response?.verificationLink || response?.data?.verificationLink) {
          console.log('🔗 Verification Link (Development):', response.verificationLink || response.data.verificationLink);
          message += `\n\nDevelopment Mode: Click this link to verify: ${response.verificationLink || response.data.verificationLink}`;
        }
        
        // Show verification message and redirect to login
        navigate('/login', { 
          state: { 
            message: message,
            requiresVerification: true,
            email: formData.email
          } 
        });
        return;
      }
      
      // If verified or no verification needed, go to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      console.error('Error response:', err.response);
      console.error('Error message:', err.message);
      
      // Check if it's a network error
      if (!err.response) {
        setError('Cannot connect to server. Please make sure the server is running and try again.');
        return;
      }
      
      // Get detailed error message
      let errorMessage = 'Registration failed. Please try again.';
      
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

  return (
    <div className="auth-container-login">
      {/* Animated Background Elements */}
      <div className="auth-background">
        <div className="bg-shape bg-shape-1"></div>
        <div className="bg-shape bg-shape-2"></div>
        <div className="bg-shape bg-shape-3"></div>
      </div>

      <div className="auth-wrapper">
        {/* Left Side - Features & Benefits */}
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
              <span>Credit & debit card tracking</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Goal setting & bill reminders</span>
            </div>
            <div className="feature-item">
              <FaCheckCircle className="feature-icon" />
              <span>Bank-level security</span>
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

        {/* Right Side - Registration Form & Premium Info */}
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Create Your Account</h2>
            <p>Start your financial journey today</p>
          </div>

          {error && (
            <div className="auth-error-modern">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-login">
            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaUser className="label-icon" />
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input-modern"
                required
                autoFocus
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaEnvelope className="label-icon" />
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="form-input-modern"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaPhone className="label-icon" />
                Mobile Number (Optional)
              </label>
              <input
                type="tel"
                name="mobile_number"
                value={formData.mobile_number}
                onChange={handleChange}
                placeholder="+1234567890"
                className="form-input-modern"
              />
              <small style={{ color: '#666', marginTop: '5px', display: 'block', fontSize: '12px' }}>
                For account recovery and notifications
              </small>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaGlobe className="label-icon" />
                Country *
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="form-input-modern"
                required
                style={{ appearance: 'none' }}
              >
                <option value="">Select your country</option>
                {COUNTRIES.sort().map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaDollarSign className="label-icon" />
                Default Currency *
              </label>
              <select
                name="default_currency"
                value={formData.default_currency}
                onChange={handleChange}
                className="form-input-modern"
                required
                style={{ appearance: 'none' }}
              >
                {getAllCurrencies().map(currency => (
                  <option key={currency} value={currency}>
                    {currency} - {getCurrencyName(currency)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaLock className="label-icon" />
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className="form-input-modern"
                required
              />
            </div>

            <div className="form-group-modern">
              <label className="form-label-modern">
                <FaLock className="label-icon" />
                Confirm Password *
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Free Account
                  <FaArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          {/* Premium Info Section */}
          <div className="premium-info-box">
            <div className="premium-header">
              <FaRocket className="premium-icon" />
              <h3>Upgrade to Premium</h3>
            </div>
            <div className="premium-features">
              <div className="premium-feature-item">
                <FaInfinity className="premium-feature-icon" />
                <span>Unlimited everything</span>
              </div>
              <div className="premium-feature-item">
                <FaChartBar className="premium-feature-icon" />
                <span>Advanced analytics</span>
              </div>
              <div className="premium-feature-item">
                <FaBell className="premium-feature-icon" />
                <span>Smart notifications</span>
              </div>
              <div className="premium-feature-item">
                <FaDatabase className="premium-feature-icon" />
                <span>Data backup & restore</span>
              </div>
            </div>
            <div className="premium-price">
              <span className="price">$9.99</span>
              <span className="period">/month</span>
            </div>
            <Link to="/upgrade" className="premium-link-btn">
              Learn More →
            </Link>
          </div>

          <div className="auth-divider">
            <span>Already have an account?</span>
          </div>

          <Link to="/login" className="btn-register-link">
            Sign in instead
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

export default Register;
