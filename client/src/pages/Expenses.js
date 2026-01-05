import React, { useState, useEffect } from 'react';
import { expensesAPI, creditCardsAPI, debitCardsAPI } from '../services/api';
import { FaPlus, FaTrash, FaEdit, FaExchangeAlt } from 'react-icons/fa';
import { convertCurrency, formatCurrency as formatCurrencyUtil, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import { useAuth } from '../context/AuthContext';
import './FinancialPages.css';

const Expenses = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [debitCards, setDebitCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [displayCurrency, setDisplayCurrency] = useState(user?.default_currency || 'USD');
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    amount: '',
    currency: user?.default_currency || 'USD',
    payment_method: 'cash',
    credit_card_id: '',
    debit_card_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, cardsRes, debitCardsRes] = await Promise.all([
        expensesAPI.getAll(),
        creditCardsAPI.getAll(),
        debitCardsAPI.getAll()
      ]);
      setExpenses(expensesRes.data || []);
      setCreditCards(cardsRes.data || []);
      setDebitCards(debitCardsRes.data || []);
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
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, formData);
      } else {
        await expensesAPI.create(formData);
      }
      setShowModal(false);
      setEditingExpense(null);
      setFormData({
        category: '',
        description: '',
        amount: '',
        currency: user?.default_currency || 'USD',
        payment_method: 'cash',
        credit_card_id: '',
        debit_card_id: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving expense';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      currency: expense.currency || user?.default_currency || 'USD',
      payment_method: expense.payment_method || 'cash',
      credit_card_id: expense.credit_card_id || '',
      debit_card_id: expense.debit_card_id || '',
      date: expense.date
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expensesAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense');
      }
    }
  };

  const formatCurrency = (amount, currency) => {
    const expenseCurrency = currency || user?.default_currency || 'USD';
    if (displayCurrency && displayCurrency !== expenseCurrency) {
      const converted = convertCurrency(amount, expenseCurrency, displayCurrency);
      return formatCurrencyUtil(converted, displayCurrency);
    }
    return formatCurrencyUtil(amount, expenseCurrency);
  };

  const categories = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  // Calculate totals and statistics
  const totalExpenses = expenses.reduce((sum, exp) => {
    const currency = exp.currency || user?.default_currency || 'USD';
    const amount = exp.amount || 0;
    if (displayCurrency && displayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, displayCurrency);
    }
    return sum + amount;
  }, 0);

  const monthlyExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  }).reduce((sum, exp) => {
    const currency = exp.currency || user?.default_currency || 'USD';
    const amount = exp.amount || 0;
    if (displayCurrency && displayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, displayCurrency);
    }
    return sum + amount;
  }, 0);

  const categoryTotals = expenses.reduce((acc, exp) => {
    const currency = exp.currency || user?.default_currency || 'USD';
    const amount = exp.amount || 0;
    let convertedAmount = amount;
    if (displayCurrency && displayCurrency !== currency) {
      convertedAmount = convertCurrency(amount, currency, displayCurrency);
    }
    acc[exp.category] = (acc[exp.category] || 0) + convertedAmount;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
  const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>Expenses</h2>
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
              setEditingExpense(null);
              setFormData({
                category: '',
                description: '',
                amount: '',
                currency: user?.default_currency || 'USD',
                payment_method: 'cash',
                credit_card_id: '',
                debit_card_id: '',
                date: new Date().toISOString().split('T')[0]
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Expense
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {expenses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Expenses</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(totalExpenses, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>This Month</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(monthlyExpenses, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
            <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Average Expense</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrencyUtil(avgExpense, displayCurrency)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                Per transaction
              </div>
            </div>
            {topCategory && (
              <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Top Category</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{topCategory[0]}</div>
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                  {formatCurrencyUtil(topCategory[1], displayCurrency)}
                </div>
              </div>
            )}
          </div>
        )}

        {expenses.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💸</div>
            <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>No Expenses Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Start tracking your spending by adding your first expense.
            </p>
            <small style={{ display: 'block', marginTop: '10px', color: 'var(--text-secondary)', fontSize: '13px' }}>
              💡 Travel-friendly: You can add expenses in any currency and convert them for easy tracking!
            </small>
          </div>
        ) : (
          <table className="table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px', fontSize: '12px' }}>Date</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Category</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Description</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Amount</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Payment Method</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Card</th>
                <th style={{ padding: '10px', fontSize: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td style={{ padding: '10px' }}>{new Date(expense.date).toLocaleDateString()}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      background: '#e0f2fe', 
                      color: '#0369a1', 
                      fontSize: '11px', 
                      fontWeight: '600' 
                    }}>
                      {expense.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>{expense.description || '-'}</td>
                  <td style={{ padding: '10px', fontWeight: '600', color: '#ef4444' }}>
                    {formatCurrency(expense.amount, expense.currency)}
                    {expense.currency && expense.currency !== displayCurrency && (
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '2px', fontWeight: '400' }}>
                        {expense.currency} {formatCurrencyUtil(expense.amount, expense.currency)}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{expense.payment_method}</span>
                  </td>
                  <td style={{ padding: '10px', fontSize: '12px' }}>{expense.card_name || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <button
                      className="btn"
                      onClick={() => handleEdit(expense)}
                      style={{ padding: '4px 8px', fontSize: '12px', marginRight: '5px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(expense.id)}
                      style={{ padding: '4px 8px', fontSize: '12px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
              {expenses.length > 0 && (
                <tr style={{ background: '#f3f4f6', fontWeight: 'bold', borderTop: '2px solid #ef4444' }}>
                  <td colSpan="3" style={{ textAlign: 'right', padding: '12px', fontSize: '13px' }}>
                    <strong>TOTAL:</strong>
                  </td>
                  <td style={{ padding: '12px', color: '#ef4444', fontSize: '18px', fontWeight: '700' }}>
                    {formatCurrencyUtil(totalExpenses, displayCurrency)}
                  </td>
                  <td colSpan="3" style={{ padding: '12px' }}></td>
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
              <h3>{editingExpense ? 'Edit' : 'Add'} Expense</h3>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setEditingExpense(null);
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px', padding: '10px', background: '#f3f4f6', borderRadius: '6px', fontSize: '12px', color: '#666' }}>
                💡 <strong>Travel-friendly:</strong> Select any currency when adding expenses. The system will convert it automatically!
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setFormData({ ...formData, amount: value });
                      }
                    }}
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
                  <label>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method *</label>
                  <select
                    value={formData.payment_method}
                    onChange={(e) => {
                      const method = e.target.value;
                      setFormData({ 
                        ...formData, 
                        payment_method: method,
                        credit_card_id: method === 'credit_card' ? formData.credit_card_id : '',
                        debit_card_id: method === 'debit' ? formData.debit_card_id : ''
                      });
                    }}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="debit">Debit Card</option>
                    <option value="credit_card">Credit Card</option>
                  </select>
                </div>
              </div>
              {formData.payment_method === 'credit_card' && (
                <div className="form-group">
                  <label>Credit Card *</label>
                  <select
                    value={formData.credit_card_id}
                    onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value, debit_card_id: '' })}
                    required={formData.payment_method === 'credit_card'}
                  >
                    <option value="">Select card</option>
                    {creditCards.map(card => (
                      <option key={card.id} value={card.id}>{card.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.payment_method === 'debit' && (
                <div className="form-group">
                  <label>Debit Card *</label>
                  <select
                    value={formData.debit_card_id}
                    onChange={(e) => setFormData({ ...formData, debit_card_id: e.target.value, credit_card_id: '' })}
                    required={formData.payment_method === 'debit'}
                  >
                    <option value="">Select card</option>
                    {debitCards.map(card => (
                      <option key={card.id} value={card.id}>{card.card_name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;

