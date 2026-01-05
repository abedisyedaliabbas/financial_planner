import React, { useState, useEffect } from 'react';
import { bankAccountsAPI, debitCardsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaExchangeAlt, FaLock, FaCreditCard } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { COUNTRIES, BANKS_BY_COUNTRY, CURRENCIES } from '../utils/banksData';
import { convertCurrency, formatCurrency as formatCurrencyUtil, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import './BankAccounts.css';

const BankAccounts = () => {
  const { isPremium } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [debitCards, setDebitCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(null);
  const [formData, setFormData] = useState({
    account_name: '',
    bank_name: '',
    account_number: '',
    account_type: 'Checking',
    country: '',
    currency: 'USD',
    current_balance: '',
    interest_rate: ''
  });
  const [cardFormData, setCardFormData] = useState({
    card_name: '',
    card_number: '',
    expiry_date: '',
    daily_limit: '',
    status: 'active'
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [accountsRes, cardsRes] = await Promise.all([
        bankAccountsAPI.getAll(),
        debitCardsAPI.getAll()
      ]);
      setAccounts(accountsRes.data || []);
      setDebitCards(cardsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't clear data on rate limit errors - keep existing data
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Clean up form data - convert empty strings to null for optional fields
      const cleanedData = {
        account_name: formData.account_name.trim(),
        bank_name: formData.bank_name.trim(),
        account_number: formData.account_number?.trim() || null,
        account_type: formData.account_type || 'Checking',
        country: formData.country.trim(),
        currency: formData.currency?.trim() || 'USD',
        current_balance: formData.current_balance ? parseFloat(formData.current_balance) : 0,
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null
      };
      
      if (editingAccount) {
        await bankAccountsAPI.update(editingAccount.id, cleanedData);
      } else {
        await bankAccountsAPI.create(cleanedData);
      }
      setShowModal(false);
      setEditingAccount(null);
      setFormData({
        account_name: '',
        bank_name: '',
        account_number: '',
        account_type: 'Checking',
        country: '',
        currency: 'USD',
        current_balance: '',
        interest_rate: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving bank account:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Error saving bank account';
      setError(errorMsg);
      // Don't auto-redirect, let user see the error
      alert(`Error: ${errorMsg}\n\nDetails: ${error.response?.data?.details || 'Check console for more info'}`);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      account_name: account.account_name,
      bank_name: account.bank_name,
      account_number: account.account_number || '',
      account_type: account.account_type || 'Checking',
      country: account.country || '',
      currency: account.currency || 'USD',
      current_balance: account.current_balance,
      interest_rate: account.interest_rate || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        // Ensure ID is converted to number (handles BigInt from database)
        const accountId = typeof id === 'bigint' ? Number(id) : Number(id);
        await bankAccountsAPI.delete(accountId);
        fetchData();
      } catch (error) {
        console.error('Error deleting bank account:', error);
        console.error('Error response:', error.response?.data);
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error deleting bank account';
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const handleCountryChange = (country) => {
    setFormData({
      ...formData,
      country,
      currency: CURRENCIES[country] || 'USD',
      bank_name: ''
    });
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (displayCurrency && displayCurrency !== currency) {
      const converted = convertCurrency(amount, currency, displayCurrency);
      return formatCurrencyUtil(converted, displayCurrency);
    }
    return formatCurrencyUtil(amount, currency);
  };

  // Calculate totals
  const totalBalance = accounts.reduce((sum, account) => {
    const currency = account.currency || 'USD';
    const balance = account.current_balance || 0;
    if (displayCurrency && displayCurrency !== currency) {
      return sum + convertCurrency(balance, currency, displayCurrency);
    }
    return sum + balance;
  }, 0);
  const displayCurr = displayCurrency || (accounts[0]?.currency || 'USD');
  const totalDebitCards = debitCards.length;
  const accountsByType = accounts.reduce((acc, account) => {
    const type = account.account_type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>Bank Accounts</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExchangeAlt style={{ color: '#667eea' }} />
              <select
                value={displayCurrency || ''}
                onChange={(e) => setDisplayCurrency(e.target.value || null)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Show Original Currency</option>
                {getAllCurrencies().map(curr => (
                  <option key={curr} value={curr}>
                    {curr} - {getCurrencyName(curr)}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setEditingAccount(null);
              setError(null);
              setFormData({
                account_name: '',
                bank_name: '',
                account_number: '',
                account_type: 'Checking',
                country: '',
                currency: 'USD',
                current_balance: '',
                interest_rate: ''
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Bank Account
            </button>
          </div>
        </div>

        {error && (
          <div className="card" style={{ marginBottom: '15px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{error}</span>
              {!isPremium() && <Link to="/upgrade" style={{ color: 'white', textDecoration: 'underline' }}>Upgrade to Premium →</Link>}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {accounts.length > 0 && (
          <div className="summary-cards-grid">
            <div className="summary-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', margin: 0 }}>
              <h3>Total Balance</h3>
              <div className="summary-value">{formatCurrencyUtil(totalBalance, displayCurr)}</div>
              <div className="summary-subtitle">{accounts.length} account{accounts.length !== 1 ? 's' : ''}</div>
            </div>
            <div className="summary-card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', margin: 0 }}>
              <h3>Total Accounts</h3>
              <div className="summary-value">{accounts.length}</div>
              <div className="summary-subtitle">{Object.keys(accountsByType).length} different types</div>
            </div>
            <div className="summary-card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0 }}>
              <h3>Debit Cards</h3>
              <div className="summary-value">{totalDebitCards}</div>
              <div className="summary-subtitle">Across all accounts</div>
            </div>
            <div className="summary-card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', margin: 0 }}>
              <h3>Average Balance</h3>
              <div className="summary-value">
                {formatCurrencyUtil(accounts.length > 0 ? totalBalance / accounts.length : 0, displayCurr)}
              </div>
              <div className="summary-subtitle">Per account</div>
            </div>
          </div>
        )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {accounts.map((account) => (
          <div key={account.id} className="card" style={{ margin: 0, padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px' }}>
                  <FaBuilding />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{account.account_name}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{account.bank_name}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  className="btn" 
                  onClick={() => handleEdit(account)}
                  style={{ padding: '6px 10px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <FaEdit />
                </button>
                <button 
                  className="btn" 
                  onClick={() => handleDelete(account.id)}
                  style={{ padding: '6px 10px', fontSize: '12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '15px', padding: '15px', background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 100%)', borderRadius: '8px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Current Balance</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {formatCurrency(account.current_balance, account.currency)}
              </div>
              {displayCurrency && displayCurrency !== account.currency && (
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {account.currency} {formatCurrencyUtil(account.current_balance, account.currency)}
                </div>
              )}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px', fontSize: '13px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '2px' }}>Type</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{account.account_type}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '2px' }}>Country</div>
                <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{account.country || 'N/A'}</div>
              </div>
              {account.account_number && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '2px' }}>Account #</div>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>•••• {account.account_number}</div>
                </div>
              )}
              {account.interest_rate && (
                <div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '2px' }}>Interest Rate</div>
                  <div style={{ fontWeight: '600', color: '#10b981' }}>{account.interest_rate}%</div>
                </div>
              )}
            </div>
            
            {/* Debit Cards Section */}
            <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#333' }}>
                  <FaCreditCard style={{ marginRight: '8px', color: '#667eea' }} />
                  Debit Cards ({(() => {
                    const accountCards = debitCards.filter(card => card.bank_account_id === account.id);
                    return accountCards.length;
                  })()}/5)
                </h4>
                {(() => {
                  const accountCards = debitCards.filter(card => card.bank_account_id === account.id);
                  if (accountCards.length < 5) {
                    return (
                      <button
                        className="btn"
                        onClick={() => {
                          setSelectedAccountId(account.id);
                          setEditingCard(null);
                          setCardFormData({
                            card_name: '',
                            card_number: '',
                            expiry_date: '',
                            daily_limit: '',
                            status: 'active'
                          });
                          setShowCardModal(true);
                        }}
                        style={{ padding: '6px 12px', fontSize: '12px', background: '#667eea', color: 'white' }}
                      >
                        <FaPlus /> Add Card
                      </button>
                    );
                  }
                  return (
                    <span style={{ fontSize: '12px', color: '#999' }}>Maximum reached</span>
                  );
                })()}
              </div>
              {(() => {
                const accountCards = debitCards.filter(card => card.bank_account_id === account.id);
                if (accountCards.length === 0) {
                  return (
                    <p style={{ fontSize: '13px', color: '#999', margin: 0, fontStyle: 'italic' }}>
                      No debit cards added yet
                    </p>
                  );
                }
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {accountCards.map(card => (
                      <div key={card.id} style={{ 
                        padding: '10px', 
                        background: '#f9fafb', 
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', fontSize: '14px', color: '#333' }}>
                            {card.card_name}
                          </div>
                          {card.card_number && (
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              •••• {card.card_number.slice(-4)}
                            </div>
                          )}
                          {card.expiry_date && (
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
                              Expires: {card.expiry_date}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button
                            className="btn"
                            onClick={() => {
                              setEditingCard(card);
                              setSelectedAccountId(card.bank_account_id);
                              setCardFormData({
                                card_name: card.card_name,
                                card_number: card.card_number || '',
                                expiry_date: card.expiry_date || '',
                                daily_limit: card.daily_limit || '',
                                status: card.status || 'active'
                              });
                              setShowCardModal(true);
                            }}
                            style={{ padding: '4px 8px', fontSize: '11px', background: '#3b82f6', color: 'white' }}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this debit card?')) {
                                try {
                                  await debitCardsAPI.delete(card.id);
                                  fetchData();
                                } catch (error) {
                                  console.error('Error deleting debit card:', error);
                                  alert('Error deleting debit card');
                                }
                              }
                            }}
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        ))}
      </div>
      </div>

      {accounts.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🏦</div>
          <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>No Bank Accounts Yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
            Start tracking your finances by adding your first bank account.
          </p>
          <button className="btn btn-primary" onClick={() => {
            setEditingAccount(null);
            setError(null);
            setFormData({
              account_name: '',
              bank_name: '',
              account_number: '',
              account_type: 'Checking',
              country: '',
              currency: 'USD',
              current_balance: '',
              interest_rate: ''
            });
            setShowModal(true);
          }}>
            <FaPlus /> Add Your First Bank Account
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingAccount ? 'Edit' : 'Add'} Bank Account</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Account Name *</label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                  placeholder="e.g., Main Checking, Salary Account"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input
                    type="text"
                    list={`bank-list-${formData.country || 'default'}`}
                    value={formData.bank_name}
                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                    placeholder={formData.country ? "Select from list or type custom bank name" : "Enter bank name"}
                    required
                  />
                  <datalist id={`bank-list-${formData.country || 'default'}`}>
                    {formData.country && BANKS_BY_COUNTRY[formData.country] ? (
                      <>
                        {BANKS_BY_COUNTRY[formData.country].map(bank => (
                          <option key={bank} value={bank} />
                        ))}
                        <option value="Other (Enter custom bank name)" />
                      </>
                    ) : (
                      <>
                        {Object.values(BANKS_BY_COUNTRY).flat().filter((bank, index, self) => 
                          self.indexOf(bank) === index
                        ).slice(0, 20).map(bank => (
                          <option key={bank} value={bank} />
                        ))}
                        <option value="Other (Enter custom bank name)" />
                      </>
                    )}
                  </datalist>
                  <small>
                    {formData.country 
                      ? `Select from ${BANKS_BY_COUNTRY[formData.country]?.length || 0} suggested banks for ${formData.country} or type any bank name`
                      : "Select a country to see bank suggestions, or type any bank name"}
                  </small>
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    required
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Type *</label>
                  <select
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    required
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Current">Current</option>
                    <option value="Business">Business</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="USD, EUR, GBP, etc."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    value={formData.account_number}
                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                    placeholder="Last 4 digits (optional)"
                  />
                </div>
                <div className="form-group">
                  <label>Current Balance</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers, decimal point, and negative sign
                      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                        setFormData({ ...formData, current_balance: value });
                      }
                    }}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Interest Rate (%)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.interest_rate}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and decimal point (no negative for interest rate)
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setFormData({ ...formData, interest_rate: value });
                    }
                  }}
                  placeholder="Annual interest rate"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Debit Card Modal */}
      {showCardModal && (
        <div className="modal" onClick={() => setShowCardModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCard ? 'Edit' : 'Add'} Debit Card</h3>
              <button className="close-btn" onClick={() => setShowCardModal(false)}>×</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const account = accounts.find(acc => acc.id === selectedAccountId);
                const cardData = {
                  ...cardFormData,
                  bank_account_id: selectedAccountId,
                  currency: account?.currency || 'USD'
                };
                
                if (editingCard) {
                  await debitCardsAPI.update(editingCard.id, cardData);
                } else {
                  await debitCardsAPI.create(cardData);
                }
                setShowCardModal(false);
                setEditingCard(null);
                setCardFormData({
                  card_name: '',
                  card_number: '',
                  expiry_date: '',
                  daily_limit: '',
                  status: 'active'
                });
                fetchData();
              } catch (error) {
                console.error('Error saving debit card:', error);
                const errorMessage = error.response?.data?.error || error.message || 'Error saving debit card';
                alert(`Error: ${errorMessage}`);
              }
            }}>
              <div className="form-group">
                <label>Card Name *</label>
                <input
                  type="text"
                  value={cardFormData.card_name}
                  onChange={(e) => setCardFormData({ ...cardFormData, card_name: e.target.value })}
                  placeholder="e.g., Primary Debit Card, Travel Card"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Card Number (Last 4 digits)</label>
                  <input
                    type="text"
                    maxLength="4"
                    value={cardFormData.card_number}
                    onChange={(e) => setCardFormData({ ...cardFormData, card_number: e.target.value })}
                    placeholder="e.g., 1234"
                  />
                </div>
                <div className="form-group">
                  <label>Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    maxLength="5"
                    value={cardFormData.expiry_date}
                    onChange={(e) => setCardFormData({ ...cardFormData, expiry_date: e.target.value })}
                    placeholder="MM/YY"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Daily Limit (Optional)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  value={cardFormData.daily_limit}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow numbers and decimal point
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      setCardFormData({ ...cardFormData, daily_limit: value });
                    }
                  }}
                  placeholder="e.g., 1000"
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={cardFormData.status}
                  onChange={(e) => setCardFormData({ ...cardFormData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lost">Lost</option>
                  <option value="stolen">Stolen</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCard ? 'Update' : 'Add'} Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccounts;
