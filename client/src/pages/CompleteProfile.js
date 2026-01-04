import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaGlobe, FaDollarSign, FaArrowRight, FaChartLine } from 'react-icons/fa';
import { COUNTRIES, CURRENCIES } from '../utils/banksData';
import { getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import { authAPI } from '../services/api';
import './Auth.css';

const CompleteProfile = () => {
  const [formData, setFormData] = useState({
    country: '',
    default_currency: 'USD'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has country and currency, redirect to dashboard
    if (user && user.country && user.default_currency) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

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
      const response = await authAPI.completeProfile({
        country: formData.country,
        default_currency: formData.default_currency
      });
      
      // Update user in context
      if (response.data?.user) {
        updateUser(response.data.user);
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Profile completion error:', err);
      let errorMessage = 'Failed to update profile. Please try again.';
      if (err.response?.data) {
        errorMessage = err.response.data.error || err.response.data.message || errorMessage;
      }
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
        {/* Left Side - Branding */}
        <div className="auth-branding">
          <div className="brand-logo">
            <div className="logo-icon">
              <FaChartLine />
            </div>
            <h1>Financial Planner</h1>
          </div>
          <p className="brand-tagline">Complete your profile to get started</p>
        </div>

        {/* Right Side - Form */}
        <div className="auth-card-login">
          <div className="auth-header-login">
            <h2>Complete Your Profile</h2>
            <p>We need a few details to personalize your experience</p>
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
                <FaGlobe className="label-icon" />
                Country of Residence *
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
              <small style={{ marginTop: '8px', display: 'block', color: '#666', fontSize: '13px' }}>
                This will be used as your default currency for all transactions
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
                  Updating Profile...
                </>
              ) : (
                <>
                  Continue to Dashboard
                  <FaArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer-login">
            <p>
              <FaChartLine className="footer-icon" />
              Your data is encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
