import React, { useState, useEffect } from 'react';
import { creditCardsAPI, bankAccountsAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaExchangeAlt, FaBell, FaChartLine, FaExclamationTriangle } from 'react-icons/fa';
import { COUNTRIES, BANKS_BY_COUNTRY, CURRENCIES } from '../utils/banksData';
import { convertCurrency, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import './FinancialPages.css';

const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(null);
  const [tableDisplayCurrency, setTableDisplayCurrency] = useState('SGD');
  const [cardCurrency, setCardCurrency] = useState('USD');
  const [cardFormData, setCardFormData] = useState({
    name: '',
    bank_account_id: '',
    bank_name: '',
    country: '',
    credit_limit: '',
    current_balance: '',
    interest_rate: '',
    due_date: '',
    card_type: 'Credit'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsRes, accountsRes] = await Promise.all([
        creditCardsAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setCards(cardsRes.data || []);
      setBankAccounts(accountsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataWithCurrency = {
        ...cardFormData,
        currency: cardCurrency
      };
      
      if (editingCard) {
        await creditCardsAPI.update(editingCard.id, formDataWithCurrency);
      } else {
        await creditCardsAPI.create(formDataWithCurrency);
      }
      setShowCardModal(false);
      setEditingCard(null);
      setDisplayCurrency(null);
      setCardCurrency('USD');
      setCardFormData({
        name: '',
        bank_account_id: '',
        bank_name: '',
        country: '',
        credit_limit: '',
        current_balance: '',
        interest_rate: '',
        due_date: '',
        card_type: 'Credit'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving card:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving credit card';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (card) => {
    setEditingCard(card);
    const country = card.country || '';
    const currency = card.currency || CURRENCIES[country] || 'USD';
    setCardCurrency(currency);
    setCardFormData({
      name: card.name,
      bank_account_id: card.bank_account_id || '',
      bank_name: card.bank_name || '',
      country: country,
      credit_limit: card.credit_limit,
      current_balance: card.current_balance,
      interest_rate: card.interest_rate || '',
      due_date: card.due_date ? String(card.due_date).padStart(2, '0') : '',
      card_type: card.card_type || 'Credit'
    });
    setShowCardModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      try {
        await creditCardsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting card:', error);
        alert('Error deleting credit card');
      }
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
      const converted = convertCurrency(amount, currency, tableDisplayCurrency);
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: tableDisplayCurrency
      }).format(converted || 0);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const calculateUtilization = (card) => {
    if (!card.credit_limit || card.credit_limit === 0) return 0;
    return ((card.current_balance || 0) / card.credit_limit * 100).toFixed(1);
  };

  const calculateMinimumPayment = (card) => {
    const balance = card.current_balance || 0;
    const minPayment = Math.max(balance * 0.02, 25); // Typically 2% or $25 minimum
    return minPayment;
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const due = new Date(currentYear, currentMonth, parseInt(dueDate));
    if (due < today) {
      due.setMonth(due.getMonth() + 1);
    }
    const diff = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getUpcomingPayments = () => {
    return cards.filter(card => {
      if (!card.due_date) return false;
      const daysUntil = getDaysUntilDue(card.due_date);
      return daysUntil <= 7 && daysUntil >= 0;
    });
  };

  const getHighUtilization = () => {
    return cards.filter(card => {
      const utilization = parseFloat(calculateUtilization(card));
      return utilization >= 80;
    });
  };

  const upcomingPayments = getUpcomingPayments();
  const highUtilization = getHighUtilization();
  const totalCreditLimit = cards.reduce((sum, card) => {
    const cardCurrency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
    const amount = card.credit_limit || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== cardCurrency) {
      return sum + convertCurrency(amount, cardCurrency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);
  const totalBalance = cards.reduce((sum, card) => {
    const cardCurrency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
    const amount = card.current_balance || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== cardCurrency) {
      return sum + convertCurrency(amount, cardCurrency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);
  const overallUtilization = totalCreditLimit > 0 ? ((totalBalance / totalCreditLimit) * 100).toFixed(1) : 0;

  return (
    <div>
      {/* Summary Cards */}
      {cards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', margin: 0, padding: '15px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Credit Limit</h3>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalCreditLimit, tableDisplayCurrency || 'SGD')}</div>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', margin: 0, padding: '15px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Outstanding (Owed to Bank)</h3>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalBalance, tableDisplayCurrency || 'SGD')}</div>
          </div>
          <div className="card" style={{ background: overallUtilization >= 80 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', margin: 0, padding: '15px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Credit Utilization</h3>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{overallUtilization}%</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
              {overallUtilization >= 80 ? '⚠️ High' : overallUtilization >= 50 ? '⚠️ Moderate' : '✓ Good'}
            </div>
          </div>
          <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0, padding: '15px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Available Credit (Remaining)</h3>
            <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalCreditLimit - totalBalance, tableDisplayCurrency || 'SGD')}</div>
          </div>
        </div>
      )}

      {/* Alerts */}
          {upcomingPayments.length > 0 && (
            <div className="card" style={{ marginBottom: '15px', background: `linear-gradient(135deg, var(--warning-color-start) 0%, var(--warning-color-end) 100%)`, color: 'white', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaBell style={{ fontSize: '16px' }} />
              <h3 style={{ margin: 0, color: 'white', fontSize: '14px' }}>Upcoming Payments (Next 7 Days)</h3>
            </div>
            {upcomingPayments.map(card => {
              const daysUntil = getDaysUntilDue(card.due_date);
              const currency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
              const minPayment = calculateMinimumPayment(card);
              return (
                <div key={card.id} style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                  <strong>{card.name}</strong> - Min payment: {formatCurrency(minPayment, currency)} due in {daysUntil} days
                </div>
              );
            })}
          </div>
        )}

        {highUtilization.length > 0 && (
          <div className="card" style={{ marginBottom: '15px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaExclamationTriangle style={{ fontSize: '16px' }} />
              <h3 style={{ margin: 0, color: 'white', fontSize: '14px' }}>High Credit Utilization Warning</h3>
            </div>
            {highUtilization.map(card => {
              const utilization = calculateUtilization(card);
              const currency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
              return (
                <div key={card.id} style={{ padding: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', marginBottom: '6px', fontSize: '12px' }}>
                  <strong>{card.name}</strong> - {utilization}% utilized ({formatCurrency(card.current_balance, currency)} / {formatCurrency(card.credit_limit, currency)})
                </div>
              );
            })}
          </div>
        )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '20px', margin: 0 }}>Credit & Debit</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExchangeAlt style={{ color: '#667eea' }} />
              <select
                value={tableDisplayCurrency || 'SGD'}
                onChange={(e) => setTableDisplayCurrency(e.target.value || 'SGD')}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="SGD">SGD - Singapore Dollar (Default)</option>
                <option value="">Show Original Currency</option>
                {getAllCurrencies().map(curr => (
                  <option key={curr} value={curr}>
                    {curr} - {getCurrencyName(curr)}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setEditingCard(null);
              setDisplayCurrency(null);
              setCardCurrency('USD');
              setCardFormData({
                name: '',
                bank_account_id: '',
                bank_name: '',
                country: '',
                credit_limit: '',
                current_balance: '',
                interest_rate: '',
                due_date: '',
                card_type: 'Credit'
              });
              setShowCardModal(true);
            }}>
              <FaPlus /> Add Credit Card
            </button>
          </div>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ fontSize: '13px', padding: '10px' }}>Name</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Bank / Country</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Credit Limit</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Outstanding (Owed)</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Available (Remaining)</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Utilization</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Interest Rate</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Due Date</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Min Payment</th>
              <th style={{ fontSize: '13px', padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => {
              const available = (card.credit_limit || 0) - (card.current_balance || 0);
              const cardCurrency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
              const utilization = calculateUtilization(card);
              const minPayment = calculateMinimumPayment(card);
              const daysUntil = getDaysUntilDue(card.due_date);
              
              return (
                <tr key={card.id}>
                  <td style={{ fontSize: '13px', padding: '10px' }}><strong>{card.name}</strong></td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>
                    {card.bank_name || '-'}
                    {card.country && <span style={{ fontSize: '11px', color: '#666', marginLeft: '5px' }}>({card.country})</span>}
                  </td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>{formatCurrency(card.credit_limit, cardCurrency)}</td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>{formatCurrency(card.current_balance, cardCurrency)}</td>
                  <td style={{ fontSize: '13px', padding: '10px', color: available < 0 ? '#ef4444' : '#10b981' }}>
                    {formatCurrency(available, cardCurrency)}
                  </td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, height: '18px', background: '#e5e7eb', borderRadius: '9px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${Math.min(utilization, 100)}%`, 
                            height: '100%', 
                            background: utilization >= 80 ? '#ef4444' : utilization >= 50 ? '#f59e0b' : '#10b981',
                            transition: 'width 0.3s' 
                          }}
                        ></div>
                      </div>
                      <span style={{ fontSize: '11px', color: utilization >= 80 ? '#ef4444' : utilization >= 50 ? '#f59e0b' : '#666', minWidth: '40px' }}>
                        {utilization}%
                      </span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>{card.interest_rate ? `${card.interest_rate}%` : '-'}</td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>
                    {card.due_date ? (
                      <div>
                        <div style={{ fontSize: '12px' }}>Day {card.due_date}</div>
                        {daysUntil !== null && (
                          <small style={{ fontSize: '10px', color: daysUntil <= 7 ? '#ef4444' : daysUntil <= 14 ? '#f59e0b' : '#10b981' }}>
                            {daysUntil > 0 ? `${daysUntil} days` : 'Due today'}
                          </small>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>{formatCurrency(minPayment, cardCurrency)}</td>
                  <td style={{ fontSize: '13px', padding: '10px' }}>
                    <button
                      className="btn"
                      onClick={() => handleEdit(card)}
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px', background: '#3b82f6', color: 'white' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(card.id)}
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {cards.length > 0 && (
              <tr style={{ background: '#f3f4f6', fontWeight: 'bold', borderTop: '2px solid #667eea' }}>
                <td colSpan="2" style={{ textAlign: 'right', padding: '12px' }}>
                  <strong>TOTALS:</strong>
                </td>
                <td style={{ padding: '12px' }}>
                  {formatCurrency(totalCreditLimit, tableDisplayCurrency || 'SGD')}
                </td>
                <td style={{ padding: '12px' }}>
                  {formatCurrency(totalBalance, tableDisplayCurrency || 'SGD')}
                </td>
                <td style={{ padding: '12px', color: '#10b981' }}>
                  {formatCurrency(totalCreditLimit - totalBalance, tableDisplayCurrency || 'SGD')}
                </td>
                <td style={{ padding: '12px' }}>
                  {overallUtilization}%
                </td>
                <td colSpan="4" style={{ padding: '12px' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showCardModal && (
        <div className="modal" onClick={() => {
          setShowCardModal(false);
          setDisplayCurrency(null);
          if (!editingCard) setCardCurrency('USD');
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCard ? 'Edit' : 'Add'} Credit Card</h3>
              <button className="close-btn" onClick={() => {
                setShowCardModal(false);
                setDisplayCurrency(null);
                if (!editingCard) setCardCurrency('USD');
              }}>×</button>
            </div>
            <form onSubmit={handleCardSubmit}>
              <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <FaExchangeAlt style={{ color: '#667eea' }} />
                  <label style={{ fontWeight: '600', color: '#333' }}>Convert to Currency:</label>
                  <select
                    value={displayCurrency || ''}
                    onChange={(e) => setDisplayCurrency(e.target.value || null)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: '1px solid #ddd',
                      fontSize: '14px',
                      background: 'white',
                      cursor: 'pointer',
                      flex: 1
                    }}
                  >
                    <option value="">Show in Original Currency ({cardCurrency})</option>
                    {getAllCurrencies().map(curr => (
                      <option key={curr} value={curr}>
                        {curr} - {getCurrencyName(curr)}
                      </option>
                    ))}
                  </select>
                </div>
                {displayCurrency && displayCurrency !== cardCurrency && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Card Currency: <strong>{cardCurrency}</strong> | Display Currency: <strong>{displayCurrency}</strong>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Card Name *</label>
                <input
                  type="text"
                  value={cardFormData.name}
                  onChange={(e) => setCardFormData({ ...cardFormData, name: e.target.value })}
                  placeholder="e.g., Chase Sapphire, Amex Gold"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    value={cardFormData.country}
                    onChange={(e) => {
                      const selectedCountry = e.target.value;
                      const currency = CURRENCIES[selectedCountry] || 'USD';
                      setCardCurrency(currency);
                      setCardFormData({ 
                        ...cardFormData, 
                        country: selectedCountry,
                        bank_name: ''
                      });
                    }}
                    required
                  >
                    <option value="">Select country</option>
                    {COUNTRIES.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Card Type</label>
                  <select
                    value={cardFormData.card_type}
                    onChange={(e) => setCardFormData({ ...cardFormData, card_type: e.target.value })}
                  >
                    <option value="Credit">Credit Card</option>
                    <option value="Debit">Debit Card</option>
                    <option value="Charge">Charge Card</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Link to Bank Account (Optional)</label>
                  <select
                    value={cardFormData.bank_account_id}
                    onChange={(e) => {
                      const selectedAccount = bankAccounts.find(acc => acc.id === parseInt(e.target.value));
                      setCardFormData({
                        ...cardFormData,
                        bank_account_id: e.target.value,
                        bank_name: selectedAccount ? selectedAccount.bank_name : ''
                      });
                    }}
                  >
                    <option value="">Select bank account (optional)</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} - {account.bank_name} ({account.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Bank Name</label>
                  <input
                    type="text"
                    list={`bank-list-card-${cardFormData.country || 'default'}`}
                    value={cardFormData.bank_name}
                    onChange={(e) => setCardFormData({ ...cardFormData, bank_name: e.target.value })}
                    placeholder={cardFormData.country ? "Select from list or type custom bank name" : "Enter bank name"}
                    style={{ width: '100%' }}
                  />
                  <datalist id={`bank-list-card-${cardFormData.country || 'default'}`}>
                    {cardFormData.country && BANKS_BY_COUNTRY[cardFormData.country] ? (
                      <>
                        {BANKS_BY_COUNTRY[cardFormData.country].map(bank => (
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
                  <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
                    {cardFormData.country 
                      ? `Select from ${BANKS_BY_COUNTRY[cardFormData.country]?.length || 0} suggested banks for ${cardFormData.country} or type any bank name`
                      : "Select a country to see bank suggestions, or type any bank name"}
                  </small>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Credit Limit * ({cardCurrency})</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={cardFormData.credit_limit}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setCardFormData({ ...cardFormData, credit_limit: value });
                      }
                    }}
                    required
                  />
                  {displayCurrency && displayCurrency !== cardCurrency && cardFormData.credit_limit && (
                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#667eea', fontWeight: '500' }}>
                      ≈ {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: displayCurrency
                      }).format(convertCurrency(parseFloat(cardFormData.credit_limit) || 0, cardCurrency, displayCurrency))} ({displayCurrency})
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Outstanding Amount ({cardCurrency})</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={cardFormData.current_balance}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setCardFormData({ ...cardFormData, current_balance: value });
                      }
                    }}
                  />
                  {displayCurrency && displayCurrency !== cardCurrency && cardFormData.current_balance && (
                    <div style={{ marginTop: '5px', fontSize: '12px', color: '#667eea', fontWeight: '500' }}>
                      ≈ {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: displayCurrency
                      }).format(convertCurrency(parseFloat(cardFormData.current_balance) || 0, cardCurrency, displayCurrency))} ({displayCurrency})
                    </div>
                  )}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Interest Rate (%)</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="100"
                    value={cardFormData.interest_rate}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setCardFormData({ ...cardFormData, interest_rate: value });
                      }
                    }}
                  />
                </div>
                <div className="form-group">
                  <label>Due Date (Day of Month)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1"
                    max="31"
                    value={cardFormData.due_date}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        setCardFormData({ ...cardFormData, due_date: value });
                      }
                    }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowCardModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;
