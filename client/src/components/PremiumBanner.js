import React from 'react';
import { Link } from 'react-router-dom';
import { FaCrown, FaLock } from 'react-icons/fa';
import './PremiumBanner.css';

const PremiumBanner = ({ featureName, onUpgrade }) => {
  return (
    <div className="premium-banner">
      <div className="premium-banner-content">
        <div className="premium-banner-icon">
          <FaLock />
        </div>
        <div className="premium-banner-text">
          <h3>
            <FaCrown className="crown-icon" /> Premium Feature
          </h3>
          <p>
            {featureName} is available for Premium members only. 
            Upgrade to unlock this feature and many more!
          </p>
        </div>
        <div className="premium-banner-action">
          <Link to="/upgrade" className="btn-premium-upgrade">
            <FaCrown /> Upgrade to Premium
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PremiumBanner;

