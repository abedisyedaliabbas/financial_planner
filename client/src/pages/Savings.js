import React, { useState, useEffect } from 'react';
import { savingsAPI, bankAccountsAPI } from '../services/api';
import { FaPlus, FaEdit, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import './FinancialPages.css';

const Savings = () => {
  const { user } = useAuth();
  const [savings, setSavings] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedSavings, setSelectedSavings] = useState(null);
  const [editingSavings, setEditingSavings] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    bank_account_id: '',
    account_type: '',
    current_balance: '',
    interest_rate: '',
    goal_amount: '',
    target_date: ''
  });
  const [transactionData, setTransactionData] = useState({
    amount: '',
    transaction_type: 'deposit',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [savingsRes, accountsRes] = await Promise.all([
        savingsAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setSavings(savingsRes.data || []);
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
      if (editingSavings) {
        await savingsAPI.update(editingSavings.id, formData);
      } else {
        await savingsAPI.create(formData);
      }
      setShowModal(false);
      setEditingSavings(null);
      setFormData({
        name: '',
        bank_account_id: '',
        account_type: '',
        current_balance: '',
        interest_rate: '',
        goal_amount: '',
        target_date: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving savings:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving savings account';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleTransactionSubmit = async (e) => {
    e.preventDefault();
    try {
      await savingsAPI.addTransaction(selectedSavings.id, transactionData);
      setShowTransactionModal(false);
      setSelectedSavings(null);
      setTransactionData({
        amount: '',
        transaction_type: 'deposit',
        description: '',
        date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Error adding transaction');
    }
  };

  const handleEdit = (saving) => {
    setEditingSavings(saving);
    setFormData({
      name: saving.name,
      bank_account_id: saving.bank_account_id || '',
      account_type: saving.account_type || '',
      current_balance: saving.current_balance,
      interest_rate: saving.interest_rate || '',
      goal_amount: saving.goal_amount || '',
      target_date: saving.target_date || ''
    });
    setShowModal(true);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.default_currency || 'USD'
    }).format(amount || 0);
  };

  const getProgress = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min((current / goal) * 100, 100);
  };

  const totalSavings = savings.reduce((sum, saving) => sum + (saving.current_balance || 0), 0);
  const totalGoals = savings.reduce((sum, saving) => sum + (saving.goal_amount || 0), 0);
  const overallProgress = totalGoals > 0 ? (totalSavings / totalGoals * 100).toFixed(1) : 0;
  const accountsWithGoals = savings.filter(s => s.goal_amount && s.goal_amount > 0).length;

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>Savings Accounts</h2>
          <button className="btn btn-primary" onClick={() => {
            setEditingSavings(null);
            setFormData({
              name: '',
              bank_account_id: '',
              account_type: '',
              current_balance: '',
              interest_rate: '',
              goal_amount: '',
              target_date: ''
            });
            setShowModal(true);
          }}>
            <FaPlus /> Add Savings Account
          </button>
        </div>

        {/* Summary Cards */}
        {savings.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
            <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Savings</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalSavings)}</div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                {savings.length} account{savings.length !== 1 ? 's' : ''}
              </div>
            </div>
            {totalGoals > 0 && (
              <>
                <div className="card" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0, padding: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Goals</h3>
                  <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalGoals)}</div>
                  <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                    {accountsWithGoals} goal{accountsWithGoals !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="card" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: 'white', margin: 0, padding: '15px' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Progress</h3>
                  <div style={{ fontSize: '22px', fontWeight: '700' }}>{overallProgress}%</div>
                  <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                    {formatCurrency(totalSavings)} / {formatCurrency(totalGoals)}
                  </div>
                </div>
              </>
            )}
            <div className="card" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', margin: 0, padding: '15px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Remaining</h3>
              <div style={{ fontSize: '22px', fontWeight: '700' }}>
                {formatCurrency(Math.max(0, totalGoals - totalSavings))}
              </div>
              <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                To reach goals
              </div>
            </div>
          </div>
        )}

        {savings.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px', marginTop: '20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>💾</div>
            <h3 style={{ marginBottom: '10px', color: 'var(--text-primary)' }}>No Savings Accounts Yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>
              Start building your savings by creating your first savings account.
            </p>
            <button className="btn btn-primary" onClick={() => {
              setEditingSavings(null);
              setFormData({
                name: '',
                bank_account_id: '',
                account_type: '',
                current_balance: '',
                interest_rate: '',
                goal_amount: '',
                target_date: ''
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Your First Savings Account
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {savings.map((saving) => {
              const progress = getProgress(saving.current_balance, saving.goal_amount);
              return (
                <div key={saving.id} className="card" style={{ margin: 0, padding: '20px', border: '1px solid var(--border-color)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{saving.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{saving.account_type || 'Savings Account'}</p>
                    </div>
                    <button
                      className="btn"
                      onClick={() => handleEdit(saving)}
                      style={{ padding: '6px 10px', fontSize: '12px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <FaEdit />
                    </button>
                  </div>
                  <div style={{ marginBottom: '15px', padding: '15px', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>Current Balance</div>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '4px' }}>
                      {formatCurrency(saving.current_balance)}
                    </div>
                    {saving.interest_rate && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Interest: {saving.interest_rate}%
                      </div>
                    )}
                  </div>
                  {saving.goal_amount && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '14px', color: '#666' }}>Goal: {formatCurrency(saving.goal_amount)}</span>
                        <span style={{ fontSize: '14px', color: '#666' }}>{progress.toFixed(1)}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#10b981', transition: 'width 0.3s' }}></div>
                      </div>
                    </div>
                  )}
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      setSelectedSavings(saving);
                      setShowTransactionModal(true);
                    }}
                    style={{ width: '100%' }}
                  >
                    Add Transaction
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSavings ? 'Edit' : 'Add'} Savings Account</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Link to Bank Account (Optional)</label>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Account Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Emergency Fund, Vacation Savings"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Account Type</label>
                  <input
                    type="text"
                    value={formData.account_type}
                    onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
                    placeholder="e.g., Savings, Emergency Fund"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Current Balance</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Goal Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.goal_amount}
                    onChange={(e) => setFormData({ ...formData, goal_amount: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTransactionModal && selectedSavings && (
        <div className="modal" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Transaction - {selectedSavings.name}</h3>
              <button className="close-btn" onClick={() => setShowTransactionModal(false)}>×</button>
            </div>
            <form onSubmit={handleTransactionSubmit}>
              <div className="form-group">
                <label>Transaction Type *</label>
                <select
                  value={transactionData.transaction_type}
                  onChange={(e) => setTransactionData({ ...transactionData, transaction_type: e.target.value })}
                  required
                >
                  <option value="deposit">Deposit</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={transactionData.date}
                    onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({ ...transactionData, description: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowTransactionModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Transaction</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Savings;

