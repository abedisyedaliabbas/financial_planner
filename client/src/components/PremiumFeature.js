import React from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaCrown, FaCheck, FaArrowRight } from 'react-icons/fa';
import './PremiumFeature.css';

const PremiumFeature = ({ featureName, description, benefits = [] }) => {
  const defaultBenefits = [
    'Unlimited access',
    'Advanced features',
    'Priority support',
    'Regular updates'
  ];

  const displayBenefits = benefits.length > 0 ? benefits : defaultBenefits;

  return (
    <div className="premium-feature-container">
      <div className="premium-feature-card">
        <div className="premium-icon">
          <FaLock />
        </div>
        <h2 className="premium-title">
          <FaCrown className="crown-icon" />
          Premium Feature
        </h2>
        <p className="premium-description">
          {description || `${featureName} is available exclusively for Premium members.`}
        </p>
        
        <div className="premium-benefits">
          <h3>What you'll get:</h3>
          <ul>
            {displayBenefits.map((benefit, index) => (
              <li key={index}>
                <FaCheck className="check-icon" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="premium-cta">
          <Link to="/upgrade" className="btn-premium-upgrade">
            <FaCrown />
            Upgrade to Premium
            <FaArrowRight />
          </Link>
          <p className="premium-price">
            Starting at $9.99/month or $99/year
          </p>
        </div>

        <div className="premium-footer">
          <p>✨ Try free for 7 days • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeature;

