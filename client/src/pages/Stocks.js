import React, { useState, useEffect } from 'react';
import { stocksAPI } from '../services/api';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import PremiumFeature from '../components/PremiumFeature';
import './FinancialPages.css';

const Stocks = () => {
  const { user, isPremium } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);
  const [formData, setFormData] = useState({
    symbol: '',
    company_name: '',
    shares: '',
    purchase_price: '',
    current_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
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
      const response = await stocksAPI.getAll();
      setStocks(response.data || []);
    } catch (error) {
      console.error('Error fetching stocks:', error);
      // Don't clear data on rate limit errors - keep existing data
      if (error.response?.status === 429) {
        alert('Too many requests. Please wait a moment and try again.');
      } else if (error.response?.status === 403) {
        // Premium feature error - already handled by premium check above
        setStocks([]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check premium status before submitting
    if (!isPremium()) {
      alert('Stock tracking is a Premium feature. Please upgrade to Premium to use this feature.');
      setShowModal(false);
      return;
    }
    
    try {
      if (editingStock) {
        await stocksAPI.update(editingStock.id, formData);
      } else {
        await stocksAPI.create(formData);
      }
      setShowModal(false);
      setEditingStock(null);
      setFormData({
        symbol: '',
        company_name: '',
        shares: '',
        purchase_price: '',
        current_price: '',
        purchase_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
    } catch (error) {
      console.error('Error saving stock:', error);
      // Check if it's a premium feature error
      if (error.response?.status === 403 && error.response?.data?.error === 'Premium feature') {
        alert('Stock tracking is a Premium feature. Please upgrade to Premium to use this feature.');
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Error saving stock';
        alert(`Error: ${errorMessage}`);
      }
      setShowModal(false);
    }
  };

  const handleEdit = (stock) => {
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      company_name: stock.company_name || '',
      shares: stock.shares,
      purchase_price: stock.purchase_price,
      current_price: stock.current_price || stock.purchase_price,
      purchase_date: stock.purchase_date || new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock?')) {
      try {
        await stocksAPI.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting stock:', error);
        alert('Error deleting stock');
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: user?.default_currency || 'USD'
    }).format(amount || 0);
  };

  const getTotalValue = (stock) => {
    return (stock.shares || 0) * (stock.current_price || stock.purchase_price || 0);
  };

  const getTotalCost = (stock) => {
    return (stock.shares || 0) * (stock.purchase_price || 0);
  };

  const getGainLoss = (stock) => {
    return getTotalValue(stock) - getTotalCost(stock);
  };

  const getGainLossPercent = (stock) => {
    const cost = getTotalCost(stock);
    if (cost === 0) return 0;
    return ((getGainLoss(stock) / cost) * 100);
  };

  const totalPortfolioValue = stocks.reduce((sum, stock) => sum + getTotalValue(stock), 0);
  const totalPortfolioCost = stocks.reduce((sum, stock) => sum + getTotalCost(stock), 0);
  const totalGainLoss = totalPortfolioValue - totalPortfolioCost;

  // Show premium feature message if not premium
  if (!isPremium()) {
    return (
      <div className="page-container">
        <PremiumFeature
          featureName="Stock Portfolio Tracking"
          description="Track your investments, monitor portfolio performance, and analyze gains/losses with our advanced stock tracking feature."
          benefits={[
            'Track unlimited stocks and investments',
            'Real-time portfolio value calculations',
            'Gain/loss analysis with percentages',
            'Purchase price vs current price tracking',
            'Portfolio performance insights'
          ]}
        />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Stock Portfolio</h2>
          <button className="btn btn-primary" onClick={() => {
            if (!isPremium()) {
              alert('Stock tracking is a Premium feature. Please upgrade to Premium to use this feature.');
              return;
            }
            setEditingStock(null);
            setFormData({
              symbol: '',
              company_name: '',
              shares: '',
              purchase_price: '',
              current_price: '',
              purchase_date: new Date().toISOString().split('T')[0]
            });
            setShowModal(true);
          }}>
            <FaPlus /> Add Stock
          </button>
        </div>

        {stocks.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Portfolio Value</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '10px' }}>{formatCurrency(totalPortfolioValue)}</div>
            </div>
            <div className="card" style={{ margin: 0, background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Cost</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '10px' }}>{formatCurrency(totalPortfolioCost)}</div>
            </div>
            <div className={`card ${totalGainLoss >= 0 ? 'success' : 'danger'}`} style={{ margin: 0, background: totalGainLoss >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
              <h3 style={{ margin: 0, color: 'white', fontSize: '18px', fontWeight: '600' }}>Total Gain/Loss</h3>
              <div style={{ fontSize: '32px', fontWeight: '700', marginTop: '10px' }}>{formatCurrency(totalGainLoss)}</div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginTop: '5px' }}>
                {((totalGainLoss / totalPortfolioCost) * 100 || 0).toFixed(2)}%
              </div>
            </div>
          </div>
        )}

        {stocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No stocks added yet. Click "Add Stock" to get started.</p>
            <small style={{ display: 'block', marginTop: '10px', color: '#999' }}>
              💡 Premium Feature: Stock tracking is available for Premium users
            </small>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Company</th>
                <th>Shares</th>
                <th>Purchase Price</th>
                <th>Current Price</th>
                <th>Total Value</th>
                <th>Gain/Loss</th>
                <th>Purchase Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => {
                const gainLoss = getGainLoss(stock);
                const gainLossPercent = getGainLossPercent(stock);
                return (
                  <tr key={stock.id}>
                    <td><strong>{stock.symbol}</strong></td>
                    <td>{stock.company_name || '-'}</td>
                    <td>{stock.shares}</td>
                    <td>{formatCurrency(stock.purchase_price)}</td>
                    <td>{formatCurrency(stock.current_price || stock.purchase_price)}</td>
                    <td>{formatCurrency(getTotalValue(stock))}</td>
                    <td style={{ color: gainLoss >= 0 ? '#10b981' : '#ef4444' }}>
                      {formatCurrency(gainLoss)} ({gainLossPercent.toFixed(2)}%)
                    </td>
                    <td>{stock.purchase_date ? new Date(stock.purchase_date).toLocaleDateString() : '-'}</td>
                    <td>
                      <button
                        className="btn"
                        onClick={() => handleEdit(stock)}
                        style={{ padding: '5px 10px', fontSize: '14px', marginRight: '5px', background: '#3b82f6', color: 'white' }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(stock.id)}
                        style={{ padding: '5px 10px', fontSize: '14px' }}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingStock ? 'Edit' : 'Add'} Stock</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Symbol *</label>
                  <input
                    type="text"
                    value={formData.symbol}
                    onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                    required
                    placeholder="e.g., AAPL"
                  />
                </div>
                <div className="form-group">
                  <label>Company Name</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    placeholder="e.g., Apple Inc."
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shares *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.shares}
                    onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    placeholder="Leave empty to use purchase price"
                  />
                </div>
                <div className="form-group">
                  <label>Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
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
    </div>
  );
};

export default Stocks;


