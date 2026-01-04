import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { stripeAPI } from '../services/api';
import { FaCheck, FaTimes, FaCrown, FaGift, FaSpinner } from 'react-icons/fa';
import Navbar from '../components/Navbar';
import './Upgrade.css';

const Upgrade = () => {
  const { isPremium, loadSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Stripe Price IDs - These need to be set in your Stripe dashboard
  // For now, using placeholder values - you'll need to replace these with actual Price IDs
  const STRIPE_PRICE_IDS = {
    monthly: process.env.REACT_APP_STRIPE_PRICE_MONTHLY || 'price_monthly_premium',
    yearly: process.env.REACT_APP_STRIPE_PRICE_YEARLY || 'price_yearly_premium'
  };

  useEffect(() => {
    // Check if user just completed payment
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');
    
    if (success) {
      // Reload subscription info
      loadSubscription();
      // Show success message
      alert('Payment successful! Your premium subscription is now active.');
    } else if (canceled) {
      setError('Payment was canceled. You can try again anytime.');
    }
  }, [searchParams, loadSubscription]);

  const features = {
    free: [
      '1 Bank Account',
      '2 Credit & Debit Cards',
      '50 Expenses/month',
      '5 Income entries/month',
      'Basic Dashboard',
      '1 Financial Goal',
      '3 Bill Reminders',
      'CSV Export',
      'Mobile Access'
    ],
    premium: [
      'Unlimited Bank Accounts',
      'Unlimited Credit & Debit Cards',
      'Unlimited Expenses',
      'Unlimited Income entries',
      'Advanced Dashboard',
      'Unlimited Financial Goals',
      'Unlimited Bill Reminders',
      'Stock Portfolio Tracking',
      'Budget Planning & Alerts',
      'Recurring Transactions',
      'Email Bill Reminders',
      'Data Backup & Restore',
      'Excel/PDF Export',
      'Advanced Analytics',
      'Priority Support',
      'Dark Mode'
    ]
  };

  const handleUpgrade = async (planType) => {
    setLoading(true);
    setError('');
    
    try {
      const priceId = STRIPE_PRICE_IDS[planType];
      
      if (!priceId || !priceId.startsWith('price_') || priceId === 'price_monthly_premium' || priceId === 'price_yearly_premium') {
        // If using placeholder or invalid, show instructions
        setError('Stripe Price IDs need to be configured. Please set REACT_APP_STRIPE_PRICE_MONTHLY and REACT_APP_STRIPE_PRICE_YEARLY in your environment variables and restart your React app.');
        setLoading(false);
        return;
      }
      
      const response = await stripeAPI.createCheckoutSession({
        priceId: priceId,
        planType: planType
      });
      
      // Redirect to Stripe Checkout
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to create checkout session. Please try again.');
      }
    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.response?.data?.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await stripeAPI.createPortalSession();
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        setError('Failed to open subscription management. Please try again.');
      }
    } catch (err) {
      console.error('Portal error:', err);
      setError(err.response?.data?.message || 'Failed to open subscription management.');
      setLoading(false);
    }
  };

  if (isPremium()) {
    return (
      <div className="app-container">
        <Navbar />
        <div className="upgrade-page">
          <div className="upgrade-card premium-active">
            <FaCrown className="crown-icon" />
            <h1>You're a Premium Member! 🎉</h1>
            <p>Thank you for supporting Financial Planner</p>
            <div className="premium-actions">
              <button className="btn btn-primary" onClick={handleManageSubscription} disabled={loading}>
                {loading ? <><FaSpinner className="spinner" /> Loading...</> : 'Manage Subscription'}
              </button>
              <Link to="/dashboard" className="btn btn-secondary">
                Go to Dashboard
              </Link>
            </div>
            {error && <div className="upgrade-error">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar />
      <div className="upgrade-page">
      <div className="upgrade-header">
        <h1>Upgrade to Premium</h1>
        <p>Unlock unlimited features and take control of your finances</p>
      </div>

      <div className="pricing-grid">
        {/* Free Tier */}
        <div className="pricing-card free">
          <div className="pricing-header">
            <h2>Free</h2>
            <div className="price">
              <span className="amount">$0</span>
              <span className="period">/month</span>
            </div>
          </div>
          <ul className="features-list">
            {features.free.map((feature, index) => (
              <li key={index}>
                <FaCheck className="check-icon" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="pricing-footer">
            <span className="current-badge">Current Plan</span>
          </div>
        </div>

        {/* Premium Tier */}
        <div className="pricing-card premium featured">
          <div className="premium-badge">
            <FaCrown /> Most Popular
          </div>
          <div className="pricing-header">
            <h2>Premium</h2>
            <div className="price">
              <span className="amount">$9.99</span>
              <span className="period">/month</span>
            </div>
            <p className="price-note">or $99/year (save $20)</p>
          </div>
          <ul className="features-list">
            {features.premium.map((feature, index) => (
              <li key={index}>
                <FaCheck className="check-icon premium-check" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="pricing-footer">
            <div className="pricing-buttons">
              <button 
                className="btn btn-premium" 
                onClick={() => handleUpgrade('monthly')}
                disabled={loading}
              >
                {loading ? <><FaSpinner className="spinner" /> Processing...</> : '$9.99/month'}
              </button>
              <button 
                className="btn btn-premium-secondary" 
                onClick={() => handleUpgrade('yearly')}
                disabled={loading}
              >
                {loading ? <><FaSpinner className="spinner" /> Processing...</> : '$99/year (Save $20)'}
              </button>
            </div>
            {error && <div className="upgrade-error">{error}</div>}
            <p className="trial-note">
              <FaGift /> Try free for 7 days, cancel anytime
            </p>
          </div>
        </div>
      </div>

      <div className="upgrade-benefits">
        <h2>Why Upgrade?</h2>
        <div className="benefits-grid">
          <div className="benefit-card">
            <h3>🚀 Unlimited Everything</h3>
            <p>No more limits on accounts, cards, expenses, or goals</p>
          </div>
          <div className="benefit-card">
            <h3>📊 Advanced Analytics</h3>
            <p>Get insights into your spending patterns and financial health</p>
          </div>
          <div className="benefit-card">
            <h3>💼 Stock Tracking</h3>
            <p>Track your investment portfolio and see your net worth grow</p>
          </div>
          <div className="benefit-card">
            <h3>🔔 Smart Reminders</h3>
            <p>Never miss a bill with email reminders and notifications</p>
          </div>
        </div>
      </div>

      <div className="upgrade-footer">
        <Link to="/dashboard" className="back-link">
          ← Back to Dashboard
        </Link>
      </div>
      </div>
    </div>
  );
};

export default Upgrade;

