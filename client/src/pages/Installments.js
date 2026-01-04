import React, { useState, useEffect } from 'react';
import { installmentsAPI, creditCardsAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash, FaExchangeAlt, FaBell, FaCalendarAlt } from 'react-icons/fa';
import { COUNTRIES, CURRENCIES } from '../utils/banksData';
import { convertCurrency, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import './FinancialPages.css';

const Installments = () => {
  const [installments, setInstallments] = useState([]);
  const [cards, setCards] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingInstallment, setEditingInstallment] = useState(null);
  const [tableDisplayCurrency, setTableDisplayCurrency] = useState('SGD');
  const [formData, setFormData] = useState({
    credit_card_id: '',
    description: '',
    total_amount: '',
    remaining_amount: '',
    monthly_payment: '',
    interest_rate: '',
    start_date: '',
    end_date: '',
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [installmentsRes, cardsRes] = await Promise.all([
        installmentsAPI.getAll(),
        creditCardsAPI.getAll()
      ]);
      setInstallments(installmentsRes.data || []);
      setCards(cardsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingInstallment) {
        await installmentsAPI.update(editingInstallment.id, formData);
      } else {
        await installmentsAPI.create(formData);
      }
      setShowModal(false);
      setEditingInstallment(null);
      setFormData({
        credit_card_id: '',
        description: '',
        total_amount: '',
        remaining_amount: '',
        monthly_payment: '',
        interest_rate: '',
        start_date: '',
        end_date: '',
        status: 'active'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving installment:', error);
      alert('Error saving installment');
    }
  };

  const handleEdit = (installment) => {
    setEditingInstallment(installment);
    setFormData({
      credit_card_id: installment.credit_card_id || '',
      description: installment.description,
      total_amount: installment.total_amount,
      remaining_amount: installment.remaining_amount,
      monthly_payment: installment.monthly_payment,
      interest_rate: installment.interest_rate || '',
      start_date: installment.start_date || '',
      end_date: installment.end_date || '',
      status: installment.status || 'active'
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this installment?')) {
      try {
        await installmentsAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting installment:', error);
        alert('Error deleting installment');
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

  const getUpcomingPayments = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    return installments.filter(inst => {
      if (!inst.end_date) return false;
      const endDate = new Date(inst.end_date);
      return endDate <= nextMonth && inst.status === 'active';
    });
  };

  const upcomingPayments = getUpcomingPayments();

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2>Credit Card Installments</h2>
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
              setEditingInstallment(null);
              setFormData({
                credit_card_id: '',
                description: '',
                total_amount: '',
                remaining_amount: '',
                monthly_payment: '',
                interest_rate: '',
                start_date: '',
                end_date: '',
                status: 'active'
              });
              setShowModal(true);
            }}>
              <FaPlus /> Add Installment
            </button>
          </div>
        </div>

        {upcomingPayments.length > 0 && (
          <div className="card" style={{ marginBottom: '20px', background: `linear-gradient(135deg, var(--warning-color-start) 0%, var(--warning-color-end) 100%)`, color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <FaBell style={{ fontSize: '20px' }} />
              <h3 style={{ margin: 0, color: 'white' }}>Upcoming Payments</h3>
            </div>
            {upcomingPayments.map(inst => {
              const daysUntil = getDaysUntilDue(inst.end_date);
              const card = cards.find(c => c.id === inst.credit_card_id);
              const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
              return (
                <div key={inst.id} style={{ padding: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', marginBottom: '8px' }}>
                  <strong>{inst.description}</strong> - {formatCurrency(inst.monthly_payment, currency)} due in {daysUntil} days
                </div>
              );
            })}
          </div>
        )}

        <table className="table">
          <thead>
            <tr>
              <th>Card</th>
              <th>Description</th>
              <th>Total Amount</th>
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
            {installments.map((installment) => {
              const card = cards.find(c => c.id === installment.credit_card_id);
              const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
              const progress = installment.total_amount > 0 
                ? ((installment.total_amount - installment.remaining_amount) / installment.total_amount * 100).toFixed(1)
                : 0;
              const daysUntil = getDaysUntilDue(installment.end_date);
              
              return (
                <tr key={installment.id}>
                  <td>{card?.name || 'N/A'}</td>
                  <td><strong>{installment.description}</strong></td>
                  <td>{formatCurrency(installment.total_amount, currency)}</td>
                  <td>{formatCurrency(installment.remaining_amount, currency)}</td>
                  <td>{formatCurrency(installment.monthly_payment, currency)}</td>
                  <td>{installment.interest_rate ? `${installment.interest_rate}%` : '-'}</td>
                  <td>{installment.start_date ? new Date(installment.start_date).toLocaleDateString() : '-'}</td>
                  <td>
                    {installment.end_date ? (
                      <div>
                        <div>{new Date(installment.end_date).toLocaleDateString()}</div>
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
                      background: installment.status === 'active' ? '#dbeafe' : '#d1fae5',
                      color: installment.status === 'active' ? '#1e40af' : '#065f46',
                      fontSize: '12px'
                    }}>
                      {installment.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn"
                      onClick={() => handleEdit(installment)}
                      style={{ padding: '5px 10px', fontSize: '14px', marginRight: '5px', background: '#3b82f6', color: 'white' }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(installment.id)}
                      style={{ padding: '5px 10px', fontSize: '14px' }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              );
            })}
            {installments.length > 0 && (
              <tr style={{ background: '#f3f4f6', fontWeight: 'bold', borderTop: '2px solid #667eea' }}>
                <td colSpan="2" style={{ textAlign: 'right', padding: '12px' }}>
                  <strong>TOTALS:</strong>
                </td>
                <td style={{ padding: '12px' }}>
                  {(() => {
                    const total = installments.reduce((sum, inst) => {
                      const card = cards.find(c => c.id === inst.credit_card_id);
                      const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
                      const amount = inst.total_amount || 0;
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
                  {(() => {
                    const total = installments.reduce((sum, inst) => {
                      const card = cards.find(c => c.id === inst.credit_card_id);
                      const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
                      const amount = inst.remaining_amount || 0;
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
                  {(() => {
                    const total = installments.reduce((sum, inst) => {
                      const card = cards.find(c => c.id === inst.credit_card_id);
                      const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
                      const amount = inst.monthly_payment || 0;
                      if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
                        return sum + convertCurrency(amount, currency, tableDisplayCurrency);
                      }
                      return sum + amount;
                    }, 0);
                    const displayCurrency = tableDisplayCurrency || 'USD';
                    return formatCurrency(total, displayCurrency);
                  })()}
                </td>
                <td colSpan="5" style={{ padding: '12px' }}></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingInstallment ? 'Edit' : 'Add'} Installment</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Credit Card (Optional)</label>
                <select
                  value={formData.credit_card_id}
                  onChange={(e) => setFormData({ ...formData, credit_card_id: e.target.value })}
                >
                  <option value="">Select card (optional)</option>
                  {cards.map(card => (
                    <option key={card.id} value={card.id}>{card.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Apple Airpod Max, iPhone 15"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Remaining Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.remaining_amount}
                    onChange={(e) => setFormData({ ...formData, remaining_amount: e.target.value })}
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
              <div className="form-group">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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

export default Installments;
