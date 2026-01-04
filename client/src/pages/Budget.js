import React, { useState, useEffect } from 'react';
import { budgetAPI, expensesAPI } from '../services/api';
import { FaPlus } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import PremiumFeature from '../components/PremiumFeature';
import './FinancialPages.css';

const Budget = () => {
  const { user, isPremium } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    monthly_limit: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, [isPremium]);

  const fetchData = async () => {
    // Don't fetch if not premium - will show premium feature message
    if (!isPremium()) {
      return;
    }
    
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      const [budgetsRes, expensesRes] = await Promise.all([
        budgetAPI.getAll({ month: currentMonth, year: currentYear }),
        expensesAPI.getAll({
          startDate: new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0],
          endDate: new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
        })
      ]);
      setBudgets(budgetsRes.data || []);
      setExpenses(expensesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't clear data on rate limit errors - keep existing data
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 403) {
        // Premium feature error - already handled by premium check above
        setBudgets([]);
        setExpenses([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check premium status before submitting
    if (!isPremium()) {
      alert('Budget planning is a Premium feature. Please upgrade to Premium to use this feature.');
      setShowModal(false);
      return;
    }
    
    try {
      await budgetAPI.create(formData);
      setShowModal(false);
      setFormData({
        category: '',
        monthly_limit: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
      fetchData();
    } catch (error) {
      console.error('Error creating budget:', error);
      // Check if it's a premium feature error
      if (error.response?.status === 403 && error.response?.data?.error === 'Premium feature') {
        alert('Budget planning is a Premium feature. Please upgrade to Premium to use this feature.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Error creating budget';
        alert(`Error: ${errorMessage}`);
      }
      setShowModal(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.default_currency || 'USD'
    }).format(amount || 0);
  };

  const getCategorySpending = (category) => {
    return expenses
      .filter(exp => exp.category === category)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getBudgetData = () => {
    return budgets.map(budget => {
      const spent = getCategorySpending(budget.category);
      const remaining = budget.monthly_limit - spent;
      return {
        category: budget.category,
        limit: budget.monthly_limit,
        spent: spent,
        remaining: remaining,
        percentage: (spent / budget.monthly_limit) * 100
      };
    });
  };

  const chartData = getBudgetData().map(item => ({
    category: item.category,
    Limit: item.limit,
    Spent: item.spent,
    Remaining: Math.max(0, item.remaining)
  }));

  const categories = ['Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Education', 'Other'];

  // Show premium feature message if not premium
  if (!isPremium()) {
    return (
      <div className="page-container">
        <PremiumFeature
          featureName="Budget Planning"
          description="Set monthly budgets, track spending against limits, and get visual insights into your financial habits with our advanced budget planning feature."
          benefits={[
            'Set unlimited monthly budgets by category',
            'Visual budget vs spending charts',
            'Real-time spending tracking',
            'Budget alerts and notifications',
            'Progress bars and percentage tracking'
          ]}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Monthly Budget</h2>
          <button className="btn btn-primary" onClick={() => {
            if (!isPremium()) {
              alert('Budget planning is a Premium feature. Please upgrade to Premium to use this feature.');
              return;
            }
            setShowModal(true);
          }}>
            <FaPlus /> Add Budget
          </button>
        </div>

        {budgets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p>No budgets set yet. Click "Add Budget" to get started.</p>
          </div>
        ) : (
          <>
            {budgets.length > 0 && (
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ marginBottom: '20px' }}>Budget Overview</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Limit" fill="#667eea" />
                    <Bar dataKey="Spent" fill="#ef4444" />
                    <Bar dataKey="Remaining" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <table className="table" style={{ marginTop: '30px' }}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Monthly Limit</th>
                  <th>Spent</th>
                  <th>Remaining</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {budgets.map((budget) => {
                  const spent = getCategorySpending(budget.category);
                  const remaining = budget.monthly_limit - spent;
                  const percentage = (spent / budget.monthly_limit) * 100;
                  return (
                    <tr key={budget.id}>
                      <td><strong>{budget.category}</strong></td>
                      <td>{formatCurrency(budget.monthly_limit)}</td>
                      <td style={{ color: percentage > 100 ? '#ef4444' : '#333' }}>
                        {formatCurrency(spent)}
                      </td>
                      <td style={{ color: remaining < 0 ? '#ef4444' : '#10b981' }}>
                        {formatCurrency(remaining)}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ flex: 1, height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                height: '100%',
                                background: percentage > 100 ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981',
                                transition: 'width 0.3s'
                              }}
                            ></div>
                          </div>
                          <span style={{ fontSize: '14px', color: '#666', minWidth: '50px' }}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Budget</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Monthly Limit *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthly_limit}
                    onChange={(e) => setFormData({ ...formData, monthly_limit: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Month *</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Year *</label>
                  <input
                    type="number"
                    min="2020"
                    max="2100"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: '#e5e7eb' }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Add Budget</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;


