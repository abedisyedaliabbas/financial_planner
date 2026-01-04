import React, { useState, useEffect } from 'react';
import { incomeAPI, bankAccountsAPI } from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import { convertCurrency, formatCurrency as formatCurrencyUtil, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import { useAuth } from '../context/AuthContext';
import './FinancialPages.css';

const Income = () => {
  const { user } = useAuth();
  const [income, setIncome] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(user?.default_currency || 'USD');
  const [formData, setFormData] = useState({
    source: '',
    income_type: 'Salary',
    amount: '',
    currency: user?.default_currency || 'USD',
    frequency: 'Monthly',
    bank_account_id: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [incomeRes, accountsRes] = await Promise.all([
        incomeAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setIncome(incomeRes.data || []);
      setBankAccounts(accountsRes.data || []);
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
    try {
      if (editingIncome) {
        await incomeAPI.update(editingIncome.id, formData);
      } else {
        await incomeAPI.create(formData);
      }
      setShowModal(false);
      setEditingIncome(null);
      setFormData({
        source: '',
        income_type: 'Salary',
        amount: '',
        currency: user?.default_currency || 'USD',
        frequency: 'Monthly',
        bank_account_id: '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving income:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving income';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (item) => {
    setEditingIncome(item);
    setFormData({
      source: item.source,
      income_type: item.income_type || 'Salary',
      amount: item.amount,
      currency: item.currency || user?.default_currency || 'USD',
      frequency: item.frequency || 'Monthly',
      bank_account_id: item.bank_account_id || '',
      date: item.date,
      description: item.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        await incomeAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting income:', error);
        alert('Error deleting income');
      }
    }
  };

  const formatCurrency = (amount, currency) => {
    const incomeCurrency = currency || user?.default_currency || 'USD';
    if (displayCurrency && displayCurrency !== incomeCurrency) {
      const converted = convertCurrency(amount, incomeCurrency, displayCurrency);
      return formatCurrencyUtil(converted, displayCurrency);
    }
    return formatCurrencyUtil(amount, incomeCurrency);
  };

  const incomeTypes = ['Salary', 'Freelance', 'Business', 'Investment', 'Rental', 'Bonus', 'Other'];
  const frequencies = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quarterly', 'Yearly', 'One-time'];

  // Calculate totals and statistics
  const totalIncome = income.reduce((sum, inc) => {
    const currency = inc.currency || user?.default_currency || 'USD';
    const amount = inc.amount || 0;
    if (displayCurrency && displayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, displayCurrency);
    }
    return sum + amount;
  }, 0);

  const monthlyIncome = income.filter(inc => {
    const incDate = new Date(inc.date);
    const now = new Date();
    return incDate.getMonth() === now.getMonth() && incDate.getFullYear() === now.getFullYear();
  }).reduce((sum, inc) => {
    const currency = inc.currency || user?.default_currency || 'USD';
    const amount = inc.amount || 0;
    if (displayCurrency && displayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, displayCurrency);
    }
    return sum + amount;
  }, 0);

  const incomeByType = income.reduce((acc, inc) => {
    const currency = inc.currency || user?.default_currency || 'USD';
    const amount = inc.amount || 0;
    let convertedAmount = amount;
    if (displayCurrency && displayCurrency !== currency) {
      convertedAmount = convertCurrency(amount, currency, displayCurrency);
    }
    const type = inc.income_type || 'Other';
    acc[type] = (acc[type] || 0) + convertedAmount;
    return acc;
  }, {});

  const topIncomeType = Object.entries(incomeByType).sort((a, b) => b[1] - a[1])[0];
  const avgIncome = income.length > 0 ? totalIncome / income.length : 0;

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>Income</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExchangeAlt style={{ color: '#667eea' }} />
              <select
                value={displayCurrency}
                onChange={(e) => setDisplayCurrency(e.target.value)}
                style={{
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '13px',
                  background: 'white',
                  cursor: 'pointer'
                }}
              >
                {getAllCurrencies().map(curr => (
                  <option key={curr} value={curr}>
                    {curr} - {getCurrencyName(curr)}
                  </option>
                ))}
              </select>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setEditingIncome(null);
              setFormData({
                source: '',
                income_type: 'Salary',
                amount: '',
                currency: user?.default_currency || 'USD',
                frequency: 'Monthly',
                bank_account_id: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Income
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {income.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Income</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(totalIncome, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                {income.length} entry{income.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>This Month</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(monthlyIncome, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Average Income</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(avgIncome, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                Per entry
              </div>
            </div>
            {topIncomeType && (
              <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Top Source</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{topIncomeType[0]}</div>
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                  {formatCurrencyUtil(topIncomeType[1], displayCurrency)}
                </div>
              </div>
            )}
          </div>
        )}

        {income.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💰</div>
            <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>No Income Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Start tracking your income by adding your first entry.
            </p>
            <button className="btn btn-primary" onClick={() => {
              setEditingIncome(null);
              setFormData({
                source: '',
                income_type: 'Salary',
                amount: '',
                currency: user?.default_currency || 'USD',
                frequency: 'Monthly',
                bank_account_id: '',
                date: new Date().toISOString().split('T')[0],
                description: ''
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Your First Income
            </button>
          </div>
        ) : (
          <table className="table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', fontSize: '12px' }}>Date</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Source</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Type</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Amount</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Frequency</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Bank Account</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Description</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {income.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '10px' }}>{new Date(item.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px' }}><strong>{item.source}</strong></td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: '#dcfce7', 
                      color: '#166534', 
                      fontSize: '11px', 
                      fontWeight: '600' 
                    }}>
                      {item.income_type || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '10px', color: '#10b981', fontWeight: '700', fontSize: '14px' }}>
                    {formatCurrency(item.amount, item.currency)}
                    {item.currency && item.currency !== displayCurrency && (
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', fontWeight: '400' }}>
                        {item.currency} {formatCurrencyUtil(item.amount, item.currency)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{item.frequency || 'N/A'}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{item.bank_account_name ? `${item.bank_account_name} (${item.bank_name})` : '-'}</td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{item.description || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      className="btn"
                      onClick={() => handleEdit(item)}
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item.id)}
                      style={{ padding: '4px 8px', fontSize: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {income.length > 0 && (
                <tr style={{ background: '#f3f4f6', fontWeight: 'bold', borderTop: '2px solid #10b981' }}>
                  <td colSpan="3" style={{ textAlign: 'right', padding: '12px', fontSize: '13px' }}>
                    <strong>TOTAL:</strong>
                  </td>
                  <td style={{ padding: '12px', color: '#10b981', fontSize: '18px', fontWeight: '700' }}>
                    {formatCurrencyUtil(totalIncome, displayCurrency)}
                  </td>
                  <td colSpan="4" style={{ padding: '12px' }}></td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingIncome ? 'Edit' : 'Add'} Income</h3>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingIncome(null);
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Source/Employer *</label>
                  <input
                    type="text"
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    placeholder="e.g., Company Name, Client Name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Income Type *</label>
                  <select
                    value={formData.income_type}
                    onChange={(e) => setFormData({ ...formData, income_type: e.target.value })}
                    required
                  >
                    {incomeTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Currency *</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    required
                  >
                    {getAllCurrencies().map(curr => (
                      <option key={curr} value={curr}>
                        {curr} - {getCurrencyName(curr)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Frequency *</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    required
                  >
                    {frequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Bank Account (Where it goes)</label>
                <select
                  value={formData.bank_account_id}
                  onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
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
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Additional notes"
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save Income</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;

