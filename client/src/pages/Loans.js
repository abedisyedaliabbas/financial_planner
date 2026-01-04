import React, { useState, useEffect } from 'react';
import { loansAPI, bankAccountsAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaExchangeAlt, FaBell, FaChartLine } from 'react-icons/fa';
import { COUNTRIES, CURRENCIES } from '../utils/banksData';
import { convertCurrency, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import './FinancialPages.css';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [tableDisplayCurrency, setTableDisplayCurrency] = useState('SGD');
  const [formData, setFormData] = useState({
    name: '',
    loan_type: 'Personal',
    lender: '',
    country: '',
    principal_amount: '',
    remaining_balance: '',
    interest_rate: '',
    monthly_payment: '',
    start_date: '',
    end_date: '',
    payment_frequency: 'monthly',
    status: 'active',
    bank_account_id: '',
    currency: 'USD'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [loansRes, accountsRes] = await Promise.all([
        loansAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setLoans(loansRes.data || []);
      setBankAccounts(accountsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Auto-set currency from country if not set
      if (!formData.currency && formData.country) {
        formData.currency = CURRENCIES[formData.country] || 'USD';
      }
      
      if (editingLoan) {
        await loansAPI.update(editingLoan.id, formData);
      } else {
        await loansAPI.create(formData);
      }
      setShowModal(false);
      setEditingLoan(null);
      setFormData({
        name: '',
        loan_type: 'Personal',
        lender: '',
        country: '',
        principal_amount: '',
        remaining_balance: '',
        interest_rate: '',
        monthly_payment: '',
        start_date: '',
        end_date: '',
        payment_frequency: 'monthly',
        status: 'active',
        bank_account_id: '',
        currency: 'USD'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving loan:', error);
      alert('Error saving loan');
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormData({
      name: loan.name,
      loan_type: loan.loan_type || 'Personal',
      lender: loan.lender || '',
      country: loan.country || '',
      principal_amount: loan.principal_amount,
      remaining_balance: loan.remaining_balance,
      interest_rate: loan.interest_rate || '',
      monthly_payment: loan.monthly_payment,
      start_date: loan.start_date || '',
      end_date: loan.end_date || '',
      payment_frequency: loan.payment_frequency || 'monthly',
      status: loan.status || 'active',
      bank_account_id: loan.bank_account_id || '',
      currency: loan.currency || 'USD'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan?')) {
      try {
        await loansAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting loan:', error);
        alert('Error deleting loan');
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

  const getDaysUntilDue = (endDate) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const calculateTotalInterest = (loan) => {
    if (!loan.principal_amount || !loan.remaining_balance) return 0;
    return loan.principal_amount - loan.remaining_balance;
  };

  const getUpcomingPayments = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return loans.filter(loan => {
      if (!loan.end_date) return false;
      const endDate = new Date(loan.end_date);
      return endDate <= nextMonth && loan.status === 'active';
    });
  };

  const upcomingPayments = getUpcomingPayments();
  const totalDebt = loans.reduce((sum, loan) => {
    const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
    const amount = loan.remaining_balance || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Loans</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaExchangeAlt style={{ color: '#667eea' }} />
              <select
                value={tableDisplayCurrency || 'SGD'}
                onChange={(e) => setTableDisplayCurrency(e.target.value || 'SGD')}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
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
              setEditingLoan(null);
              setFormData({
                name: '',
                loan_type: 'Personal',
                lender: '',
                country: '',
                principal_amount: '',
                remaining_balance: '',
                interest_rate: '',
                monthly_payment: '',
                start_date: '',
                end_date: '',
                payment_frequency: 'monthly',
                status: 'active',
                bank_account_id: '',
                currency: 'USD'
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Loan
            </button>
          </div>
        </div>

        {loans.length > 0 && (
          <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Debt</h3>
                <p style={{ margin: '5px 0 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '14px' }}>
                  Across All Loans
                </p>
              </div>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>
                {formatCurrency(totalDebt, tableDisplayCurrency || 'SGD')}
              </div>
            </div>
          </div>
        )}

            {upcomingPayments.length > 0 && (
              <div className="card" style={{ marginBottom: '20px', background: `linear-gradient(135deg, var(--warning-color-start) 0%, var(--warning-color-end) 100%)`, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FaBell style={{ fontSize: '20px' }} />
              <h3 style={{ margin: 0, color: 'white' }}>Upcoming Payments</h3>
            </div>
            {upcomingPayments.map(loan => {
              const daysUntil = getDaysUntilDue(loan.end_date);
              const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
              return (
                <div key={loan.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
                  <strong>{loan.name}</strong> - {formatCurrency(loan.monthly_payment, currency)} due in {daysUntil} days
                </div>
              );
            })}
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Loan Name</th>
              <th>Type</th>
              <th>Lender</th>
              <th>Principal</th>
              <th>Remaining</th>
              <th>Monthly Payment</th>
              <th>Interest Rate</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => {
              const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
              const progress = loan.principal_amount > 0 
                ? ((loan.principal_amount - loan.remaining_balance) / loan.principal_amount * 100).toFixed(1)
                : 0;
              const daysUntil = getDaysUntilDue(loan.end_date);
              const totalInterest = calculateTotalInterest(loan);
              
              return (
                <tr key={loan.id}>
                  <td><strong>{loan.name}</strong></td>
                  <td>{loan.loan_type}</td>
                  <td>{loan.lender || '-'}</td>
                  <td>{formatCurrency(loan.principal_amount, currency)}</td>
                  <td>{formatCurrency(loan.remaining_balance, currency)}</td>
                  <td>{formatCurrency(loan.monthly_payment, currency)}</td>
                  <td>{loan.interest_rate ? `${loan.interest_rate}%` : '-'}</td>
                  <td>{loan.start_date ? new Date(loan.start_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {loan.end_date ? (
                      <div>
                        <div>{new Date(loan.end_date).toLocaleDateString()}</div>
                        {daysUntil !== null && (
                          <small style={{ color: daysUntil < 30 ? '#ef4444' : daysUntil < 60 ? '#f59e0b' : '#10b981' }}>
                            {daysUntil > 0 ? `${daysUntil} days left` : 'Overdue'}
                          </small>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: '#667eea', transition: 'width 0.3s' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: '#666', minWidth: '40px' }}>{progress}%</span>
                    </div>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: loan.status === 'active' ? '#dbeafe' : '#d1fae5',
                      color: loan.status === 'active' ? '#1e40af' : '#065f46',
                      fontSize: '12px'
                    }}>
                      {loan.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => handleEdit(loan)}
                      style={{ padding: '5px 10px', fontSize: '14px', marginRight: '5px', background: '#3b82f6', color: 'white' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(loan.id)}
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {loans.length > 0 && (
              <tr style={{ background: '#f3f4f6', fontWeight: 'bold', borderTop: '2px solid #667eea' }}>
                <td colSpan="3" style={{ textAlign: 'right', padding: '12px' }}>
                  <strong>TOTALS:</strong>
                </td>
                <td style={{ padding: '12px' }}>
                  {(() => {
                    const total = loans.reduce((sum, loan) => {
                      const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
                      const amount = loan.principal_amount || 0;
                      if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
                        return sum + convertCurrency(amount, currency, tableDisplayCurrency);
                      }
                      return sum + amount;
                    }, 0);
                    const displayCurrency = tableDisplayCurrency || 'USD';
                    return formatCurrency(total, displayCurrency);
                  })()}
                </td>
                <td style={{ padding: '12px' }}>
                  {formatCurrency(totalDebt, tableDisplayCurrency || 'SGD')}
                </td>
                <td style={{ padding: '12px' }}>
                  {(() => {
                    const total = loans.reduce((sum, loan) => {
                      const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
                      const amount = loan.monthly_payment || 0;
                      if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
                        return sum + convertCurrency(amount, currency, tableDisplayCurrency);
                      }
                      return sum + amount;
                    }, 0);
                    const displayCurrency = tableDisplayCurrency || 'USD';
                    return formatCurrency(total, displayCurrency);
                  })()}
                </td>
                <td colSpan="6" style={{ padding: '12px' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingLoan ? 'Edit' : 'Add'} Loan</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Loan Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Personal Loan, Auto Loan"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Loan Type *</label>
                  <select
                    value={formData.loan_type}
                    onChange={(e) => setFormData({ ...formData, loan_type: e.target.value })}
                    required
                  >
                    <option value="Personal">Personal Loan</option>
                    <option value="Auto">Auto Loan</option>
                    <option value="Student">Student Loan</option>
                    <option value="Mortgage">Mortgage</option>
                    <option value="Business">Business Loan</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lender</label>
                  <input
                    type="text"
                    value={formData.lender}
                    onChange={(e) => setFormData({ ...formData, lender: e.target.value })}
                    placeholder="e.g., Bank Name, Credit Union"
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <select
                    value={formData.country}
                    onChange={(e) => {
                      const country = e.target.value;
                      const currency = CURRENCIES[country] || 'USD';
                      setFormData({ ...formData, country, currency });
                    }}
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
                  <label>Principal Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.principal_amount}
                    onChange={(e) => setFormData({ ...formData, principal_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Remaining Balance *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.remaining_balance}
                    onChange={(e) => setFormData({ ...formData, remaining_balance: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Payment *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({ ...formData, monthly_payment: e.target.value })}
                    required
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
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Payment Frequency</label>
                  <select
                    value={formData.payment_frequency}
                    onChange={(e) => setFormData({ ...formData, payment_frequency: e.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="biweekly">Bi-weekly</option>
                    <option value="weekly">Weekly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="defaulted">Defaulted</option>
                  </select>
                </div>
              </div>
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
    </div>
  );
};

export default Loans;
