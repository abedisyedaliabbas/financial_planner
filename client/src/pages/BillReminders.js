import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBell, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { creditCardsAPI, bankAccountsAPI, billRemindersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './FinancialPages.css';

const BillReminders = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    due_date: '',
    frequency: 'monthly',
    category: '',
    is_paid: false,
    credit_card_id: '',
    bank_account_id: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, cardsRes, accountsRes] = await Promise.all([
        billRemindersAPI.getAll(),
        creditCardsAPI.getAll(),
        bankAccountsAPI.getAll()
      ]);
      setBills(billsRes.data || []);
      setCreditCards(cardsRes.data || []);
      setBankAccounts(accountsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't clear data on rate limit errors - keep existing data
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.');
      }
      // Only clear if it's a 401 (unauthorized) or 404 (not found)
      if (error.response?.status === 401 || error.response?.status === 404) {
        // Don't clear, let AuthContext handle logout
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        is_paid: formData.is_paid ? 1 : 0
      };

      if (editingBill) {
        await billRemindersAPI.update(editingBill.id, data);
      } else {
        await billRemindersAPI.create(data);
      }

      setShowModal(false);
      setEditingBill(null);
      setFormData({
        name: '',
        amount: '',
        due_date: '',
        frequency: 'monthly',
        category: '',
        is_paid: false,
        credit_card_id: '',
        bank_account_id: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error saving bill:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving bill reminder';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill reminder?')) {
      try {
        await billRemindersAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting bill:', error);
        alert('Error deleting bill reminder');
      }
    }
  };

  const togglePaid = async (bill) => {
    try {
      await billRemindersAPI.update(bill.id, {
        ...bill,
        is_paid: bill.is_paid ? 0 : 1,
        last_paid_date: bill.is_paid ? null : new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error updating bill:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.default_currency || 'USD'
    }).format(amount || 0);
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

  const upcomingBills = bills.filter(bill => !bill.is_paid).sort((a, b) => {
    const daysA = getDaysUntilDue(a.due_date) || 999;
    const daysB = getDaysUntilDue(b.due_date) || 999;
    return daysA - daysB;
  });

  const paidBills = bills.filter(bill => bill.is_paid);

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Bill Reminders</h2>
          <button className="btn btn-primary" onClick={() => {
            setEditingBill(null);
            setFormData({
              name: '',
              amount: '',
              due_date: '',
              frequency: 'monthly',
              category: '',
              is_paid: false,
              credit_card_id: '',
              bank_account_id: '',
              notes: ''
            });
            setShowModal(true);
          }}>
            <FaPlus /> Add Bill Reminder
          </button>
        </div>

        {upcomingBills.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Upcoming Bills</h3>
            <div className="bills-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {upcomingBills.map((bill) => {
                const daysUntil = getDaysUntilDue(bill.due_date);
                const isOverdue = daysUntil < 0;
                const isDueSoon = daysUntil >= 0 && daysUntil <= 3;
                
                return (
                  <div 
                    key={bill.id} 
                    className="card" 
                    style={{ 
                      margin: 0,
                      borderLeft: `4px solid ${isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#10b981'}`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <FaBell style={{ color: isOverdue ? '#ef4444' : isDueSoon ? '#f59e0b' : '#667eea' }} />
                          {bill.name}
                        </h3>
                        {bill.category && (
                          <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>{bill.category}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button
                          className="btn btn-success"
                          onClick={() => togglePaid(bill)}
                          style={{ padding: '5px 10px', fontSize: '14px' }}
                          title="Mark as paid"
                        >
                          <FaCheckCircle />
                        </button>
                        <button
                          className="btn"
                          onClick={() => {
                            setEditingBill(bill);
                            setFormData({
                              name: bill.name,
                              amount: bill.amount,
                              due_date: bill.due_date ? String(bill.due_date).padStart(2, '0') : '',
                              frequency: bill.frequency || 'monthly',
                              category: bill.category || '',
                              is_paid: bill.is_paid === 1,
                              credit_card_id: bill.credit_card_id || '',
                              bank_account_id: bill.bank_account_id || '',
                              notes: bill.notes || ''
                            });
                            setShowModal(true);
                          }}
                          style={{ padding: '5px 10px', fontSize: '14px', background: '#3b82f6', color: 'white' }}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(bill.id)}
                          style={{ padding: '5px 10px', fontSize: '14px' }}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '28px', fontWeight: '700', color: '#333', marginBottom: '10px' }}>
                        {formatCurrency(bill.amount)}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px', color: '#666' }}>
                        <div>
                          <strong>Due Date:</strong> Day {bill.due_date}
                        </div>
                        <div>
                          <strong>Frequency:</strong> {bill.frequency}
                        </div>
                        {bill.card_name && (
                          <div>
                            <strong>Card:</strong> {bill.card_name}
                          </div>
                        )}
                        {bill.bank_account_name && (
                          <div>
                            <strong>Account:</strong> {bill.bank_account_name}
                          </div>
                        )}
                      </div>
                      {daysUntil !== null && (
                        <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', 
                          background: isOverdue ? '#fee2e2' : isDueSoon ? '#fef3c7' : '#d1fae5',
                          color: isOverdue ? '#991b1b' : isDueSoon ? '#92400e' : '#065f46',
                          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600'
                        }}>
                          {isOverdue ? <FaExclamationTriangle /> : <FaBell />}
                          {isOverdue ? `Overdue by ${Math.abs(daysUntil)} days` : 
                           daysUntil === 0 ? 'Due today!' : 
                           `${daysUntil} days until due`}
                        </div>
                      )}
                    </div>
                    {bill.notes && (
                      <p style={{ fontSize: '14px', color: '#666', marginTop: '10px', fontStyle: 'italic' }}>
                        {bill.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {paidBills.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Paid Bills</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Frequency</th>
                  <th>Last Paid</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paidBills.map((bill) => (
                  <tr key={bill.id} style={{ opacity: 0.7 }}>
                    <td>{bill.name}</td>
                    <td>{formatCurrency(bill.amount)}</td>
                    <td>Day {bill.due_date}</td>
                    <td>{bill.frequency}</td>
                    <td>{bill.last_paid_date ? new Date(bill.last_paid_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => togglePaid(bill)}
                        style={{ padding: '5px 10px', fontSize: '14px', background: '#10b981', color: 'white' }}
                      >
                        Mark Unpaid
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {bills.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <FaBell style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
            <p>No bill reminders set up yet. Click "Add Bill Reminder" to get started.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingBill ? 'Edit' : 'Add'} Bill Reminder</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Bill Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Electricity, Internet, Rent"
                  required
                />
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
                  <label>Due Date (Day of Month) *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
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
                    <option value="weekly">Weekly</option>
                    <option value="bi-weekly">Bi-Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Select category</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Rent/Mortgage">Rent/Mortgage</option>
                    <option value="Insurance">Insurance</option>
                    <option value="Subscription">Subscription</option>
                    <option value="Loan Payment">Loan Payment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Pay From (Credit Card)</label>
                  <select
                    value={formData.credit_card_id}
                    onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value })}
                  >
                    <option value="">Select card (optional)</option>
                    {creditCards.map(card => (
                      <option key={card.id} value={card.id}>{card.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Pay From (Bank Account)</label>
                  <select
                    value={formData.bank_account_id}
                    onChange={(e) => setFormData({ ...formData, bank_account_id: e.target.value })}
                  >
                    <option value="">Select account (optional)</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>{account.account_name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="2"
                  placeholder="Additional notes"
                />
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

export default BillReminders;


