import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBullseye, FaCheckCircle } from 'react-icons/fa';
import { financialGoalsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './FinancialPages.css';

const FinancialGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    goal_type: 'Savings',
    target_amount: '',
    current_amount: '',
    target_date: '',
    priority: 'medium',
    status: 'active',
    description: ''
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await financialGoalsAPI.getAll();
      setGoals(response.data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
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
      if (editingGoal) {
        await financialGoalsAPI.update(editingGoal.id, formData);
      } else {
        await financialGoalsAPI.create(formData);
      }
      
      setShowModal(false);
      setEditingGoal(null);
      setFormData({
        name: '',
        goal_type: 'Savings',
        target_amount: '',
        current_amount: '',
        target_date: '',
        priority: 'medium',
        status: 'active',
        description: ''
      });
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error saving goal';
      alert(`Error: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await financialGoalsAPI.delete(id);
        fetchGoals();
      } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.default_currency || 'USD'
    }).format(amount || 0);
  };

  const getProgress = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    if (!targetDate) return null;
    const today = new Date();
    const target = new Date(targetDate);
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Financial Goals</h2>
          <button className="btn btn-primary" onClick={() => {
            setEditingGoal(null);
            setFormData({
              name: '',
              goal_type: 'Savings',
              target_amount: '',
              current_amount: '',
              target_date: '',
              priority: 'medium',
              status: 'active',
              description: ''
            });
            setShowModal(true);
          }}>
            <FaPlus /> Add Goal
          </button>
        </div>

        {goals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <FaBullseye style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
            <p>No financial goals set yet. Click "Add Goal" to get started.</p>
          </div>
        ) : (
          <div className="goals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {goals.map((goal) => {
              const progress = getProgress(goal.current_amount, goal.target_amount);
              const daysRemaining = getDaysRemaining(goal.target_date);
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id} className="card" style={{ margin: 0, borderLeft: `4px solid ${goal.priority === 'high' ? '#ef4444' : goal.priority === 'medium' ? '#f59e0b' : '#10b981'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaBullseye style={{ color: '#667eea' }} />
                        {goal.name}
                      </h3>
                      <p style={{ color: '#666', fontSize: '14px', marginTop: '5px' }}>{goal.goal_type}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn"
                        onClick={() => {
                          setEditingGoal(goal);
                          setFormData({
                            name: goal.name,
                            goal_type: goal.goal_type,
                            target_amount: goal.target_amount,
                            current_amount: goal.current_amount,
                            target_date: goal.target_date || '',
                            priority: goal.priority,
                            status: goal.status,
                            description: goal.description || ''
                          });
                          setShowModal(true);
                        }}
                        style={{ padding: '5px 10px', fontSize: '14px', background: '#3b82f6', color: 'white' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(goal.id)}
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontSize: '14px', color: '#666' }}>Progress</span>
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: '600' }}>{progress.toFixed(1)}%</span>
                    </div>
                    <div style={{ width: '100%', height: '20px', background: '#e5e7eb', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
                      <div style={{ 
                        width: `${progress}%`, 
                        height: '100%', 
                        background: isCompleted ? '#10b981' : '#667eea',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '600' }}>
                      <span style={{ color: '#10b981' }}>{formatCurrency(goal.current_amount)}</span>
                      <span style={{ color: '#666' }}>of {formatCurrency(goal.target_amount)}</span>
                    </div>
                    {daysRemaining !== null && (
                      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                        {daysRemaining > 0 ? (
                          <span>{daysRemaining} days remaining</span>
                        ) : daysRemaining === 0 ? (
                          <span style={{ color: '#f59e0b' }}>Due today!</span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>Overdue by {Math.abs(daysRemaining)} days</span>
                        )}
                      </div>
                    )}
                  </div>
                  {goal.description && (
                    <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>{goal.description}</p>
                  )}
                  {isCompleted && (
                    <div style={{ marginTop: '10px', padding: '8px', background: '#d1fae5', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46' }}>
                      <FaCheckCircle /> Goal Achieved!
                    </div>
                  )}
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
              <h3>{editingGoal ? 'Edit' : 'Add'} Financial Goal</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Goal Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Emergency Fund, Vacation, House Down Payment"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Goal Type *</label>
                  <select
                    value={formData.goal_type}
                    onChange={(e) => setFormData({ ...formData, goal_type: e.target.value })}
                    required
                  >
                    <option value="Savings">Savings</option>
                    <option value="Debt Payoff">Debt Payoff</option>
                    <option value="Investment">Investment</option>
                    <option value="Purchase">Purchase</option>
                    <option value="Emergency Fund">Emergency Fund</option>
                    <option value="Retirement">Retirement</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Amount *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Current Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  placeholder="Additional notes about this goal"
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

export default FinancialGoals;


