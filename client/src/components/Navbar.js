import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { FaHome, FaCreditCard, FaPiggyBank, FaChartLine, FaWallet, FaDollarSign, FaBuilding, FaMoneyBillWave, FaBullseye, FaBell, FaBars, FaTimes, FaSignOutAlt, FaCrown, FaChartBar, FaChartPie, FaSun, FaMoon } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isPremium } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaHome },
    { path: '/bank-accounts', label: 'Bank Accounts', icon: FaBuilding },
    { path: '/income', label: 'Income', icon: FaMoneyBillWave },
    { path: '/expenses', label: 'Expenses', icon: FaDollarSign },
    { path: '/credit-cards', label: 'Credit & Debit', icon: FaCreditCard },
    { path: '/savings', label: 'Savings', icon: FaPiggyBank },
    { path: '/stocks', label: 'Stocks', icon: FaChartLine, premium: true },
    { path: '/budget', label: 'Budget', icon: FaChartPie, premium: true },
    { path: '/financial-goals', label: 'Goals', icon: FaBullseye },
    { path: '/bill-reminders', label: 'Bills', icon: FaBell },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>
      <nav className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-content">
          <div className="sidebar-brand">
            <div className="sidebar-brand-header">
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <h1>💰 Financial Planner</h1>
              </Link>
              <button 
                className="sidebar-close-btn"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>
          </div>
          
          <ul className="sidebar-menu">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              const isPremiumFeature = item.premium && !isPremium();
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`sidebar-link ${isActive ? 'active' : ''} ${isPremiumFeature ? 'premium-feature' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                    title={isPremiumFeature ? 'Premium feature - Upgrade to access' : ''}
                  >
                    <Icon />
                    <span>{item.label}</span>
                    {isPremiumFeature && <FaCrown style={{ marginLeft: 'auto', fontSize: '12px' }} />}
                  </Link>
                </li>
              );
            })}
            {!isPremium() && (
              <li>
                <Link
                  to="/upgrade"
                  className="sidebar-link upgrade-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FaCrown />
                  <span>Upgrade</span>
                </Link>
              </li>
            )}
          </ul>

          <div className="sidebar-footer">
            <div className="sidebar-user-info">
              <div className="user-info">
                <span className="user-email">{user?.email}</span>
                {isPremium() && <span className="premium-badge">⭐ Premium</span>}
              </div>
            </div>
            <div className="sidebar-actions">
              <button className="theme-toggle-btn" onClick={toggleTheme} title={`Quick toggle: ${isDark ? 'Light' : 'Dark'} mode (More themes in Appearance settings)`}>
                {isDark ? <FaSun /> : <FaMoon />}
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <FaSignOutAlt /> <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      {mobileMenuOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileMenuOpen(false)}></div>
      )}
    </>
  );
};

export default Navbar;

