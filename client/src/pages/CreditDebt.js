import React, { useState, useEffect } from 'react';
import { creditCardsAPI, installmentsAPI, loansAPI } from '../services/api';
import { FaExchangeAlt, FaChartLine, FaCreditCard, FaFileInvoiceDollar, FaHandHoldingUsd } from 'react-icons/fa';
import { CURRENCIES } from '../utils/banksData';
import { convertCurrency, getAllCurrencies, getCurrencyName } from '../utils/currencyConverter';
import CreditCards from './CreditCards';
import Installments from './Installments';
import Loans from './Loans';
import './FinancialPages.css';

const CreditDebt = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [cards, setCards] = useState([]);
  const [installments, setInstallments] = useState([]);
  const [loans, setLoans] = useState([]);
  const [tableDisplayCurrency, setTableDisplayCurrency] = useState('SGD');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cardsRes, installmentsRes, loansRes] = await Promise.all([
        creditCardsAPI.getAll(),
        installmentsAPI.getAll(),
        loansAPI.getAll()
      ]);
      setCards(cardsRes.data || []);
      setInstallments(installmentsRes.data || []);
      setLoans(loansRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  // Calculate totals
  const totalCreditLimit = cards.reduce((sum, card) => {
    const cardCurrency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
    const amount = card.credit_limit || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== cardCurrency) {
      return sum + convertCurrency(amount, cardCurrency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);

  const totalOutstanding = cards.reduce((sum, card) => {
    const cardCurrency = card.currency || (card.country && CURRENCIES[card.country]) || 'USD';
    const amount = card.current_balance || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== cardCurrency) {
      return sum + convertCurrency(amount, cardCurrency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);

  const totalAvailableCredit = totalCreditLimit - totalOutstanding;

  const totalInstallmentDebt = installments.reduce((sum, inst) => {
    const card = cards.find(c => c.id === inst.credit_card_id);
    const currency = card?.currency || (card?.country && CURRENCIES[card.country]) || 'USD';
    const amount = inst.remaining_amount || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);

  const totalLoanDebt = loans.reduce((sum, loan) => {
    const currency = loan.currency || (loan.country && CURRENCIES[loan.country]) || 'USD';
    const amount = loan.remaining_balance || 0;
    if (tableDisplayCurrency && tableDisplayCurrency !== currency) {
      return sum + convertCurrency(amount, currency, tableDisplayCurrency);
    }
    return sum + amount;
  }, 0);

  const totalDebt = totalOutstanding + totalInstallmentDebt + totalLoanDebt;
  const overallUtilization = totalCreditLimit > 0 ? ((totalOutstanding / totalCreditLimit) * 100).toFixed(1) : 0;

  if (loading) {
    return <div className="page-container">Loading...</div>;
  }

  return (
    <div className="page-container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h2 style={{ fontSize: '22px', margin: 0 }}>Credit & Debt Management</h2>
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
        </div>

        {/* Tabs */}
        <div className="tabs-container" style={{ marginTop: '10px' }}>
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine style={{ fontSize: '16px' }} /> 
            <span>Overview</span>
          </button>
          <button
            className={`tab-button ${activeTab === 'credit-cards' ? 'active' : ''}`}
            onClick={() => setActiveTab('credit-cards')}
          >
            <FaCreditCard style={{ fontSize: '16px' }} /> 
            <span>Credit & Debit</span>
            <span style={{ 
              marginLeft: '6px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: activeTab === 'credit-cards' ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
              color: activeTab === 'credit-cards' ? 'white' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {cards.length}
            </span>
          </button>
          <button
            className={`tab-button ${activeTab === 'installments' ? 'active' : ''}`}
            onClick={() => setActiveTab('installments')}
          >
            <FaFileInvoiceDollar style={{ fontSize: '16px' }} /> 
            <span>Installments</span>
            <span style={{ 
              marginLeft: '6px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: activeTab === 'installments' ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
              color: activeTab === 'installments' ? 'white' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {installments.length}
            </span>
          </button>
          <button
            className={`tab-button ${activeTab === 'loans' ? 'active' : ''}`}
            onClick={() => setActiveTab('loans')}
          >
            <FaHandHoldingUsd style={{ fontSize: '16px' }} /> 
            <span>Loans</span>
            <span style={{ 
              marginLeft: '6px', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              background: activeTab === 'loans' ? 'rgba(255,255,255,0.3)' : 'var(--border-color)',
              color: activeTab === 'loans' ? 'white' : 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {loans.length}
            </span>
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div className="card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Credit Limit</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalCreditLimit, tableDisplayCurrency || 'SGD')}</div>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Total Outstanding (Owed to Bank)</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalOutstanding, tableDisplayCurrency || 'SGD')}</div>
              </div>
              <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Available Credit (Remaining)</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{formatCurrency(totalAvailableCredit, tableDisplayCurrency || 'SGD')}</div>
              </div>
              <div className="card" style={{ background: overallUtilization >= 80 ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: 'white', margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0', color: 'white', fontSize: '13px', fontWeight: '600' }}>Credit Utilization</h3>
                <div style={{ fontSize: '22px', fontWeight: '700' }}>{overallUtilization}%</div>
                <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.9 }}>
                  {overallUtilization >= 80 ? '⚠️ High' : overallUtilization >= 50 ? '⚠️ Moderate' : '✓ Good'}
                </div>
              </div>
            </div>

            {/* Debt Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '20px' }}>
              <div className="card" style={{ margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Credit Card Debt</h3>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ef4444' }}>
                  {formatCurrency(totalOutstanding, tableDisplayCurrency || 'SGD')}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {cards.length} card{cards.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="card" style={{ margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Installment Debt</h3>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#f59e0b' }}>
                  {formatCurrency(totalInstallmentDebt, tableDisplayCurrency || 'SGD')}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {installments.length} installment{installments.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="card" style={{ margin: 0, padding: '15px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666' }}>Loan Debt</h3>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#dc2626' }}>
                  {formatCurrency(totalLoanDebt, tableDisplayCurrency || 'SGD')}
                </div>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                  {loans.length} loan{loans.length !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="card" style={{ margin: 0, padding: '15px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'white' }}>Total Debt</h3>
                <div style={{ fontSize: '24px', fontWeight: '700' }}>
                  {formatCurrency(totalDebt, tableDisplayCurrency || 'SGD')}
                </div>
                <div style={{ fontSize: '12px', marginTop: '5px', opacity: 0.9 }}>
                  All debt combined
                </div>
              </div>
            </div>

            {/* Quick Stats Table */}
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px' }}>Quick Summary</h3>
              <table className="table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '10px', fontSize: '12px' }}>Category</th>
                    <th style={{ padding: '10px', fontSize: '12px' }}>Count</th>
                    <th style={{ padding: '10px', fontSize: '12px' }}>Total Amount</th>
                    <th style={{ padding: '10px', fontSize: '12px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '10px' }}><strong>Credit & Debit</strong></td>
                    <td style={{ padding: '10px' }}>{cards.length}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(totalOutstanding, tableDisplayCurrency || 'SGD')}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: overallUtilization >= 80 ? '#fee2e2' : '#dbeafe', color: overallUtilization >= 80 ? '#991b1b' : '#1e40af', fontSize: '11px' }}>
                        {overallUtilization >= 80 ? 'High Utilization' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px' }}><strong>Installments</strong></td>
                    <td style={{ padding: '10px' }}>{installments.length}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(totalInstallmentDebt, tableDisplayCurrency || 'SGD')}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '11px' }}>
                        {installments.filter(i => i.status === 'active').length} Active
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px' }}><strong>Loans</strong></td>
                    <td style={{ padding: '10px' }}>{loans.length}</td>
                    <td style={{ padding: '10px' }}>{formatCurrency(totalLoanDebt, tableDisplayCurrency || 'SGD')}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#dbeafe', color: '#1e40af', fontSize: '11px' }}>
                        {loans.filter(l => l.status === 'active').length} Active
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Credit & Debit Tab */}
        {activeTab === 'credit-cards' && (
          <div style={{ marginTop: '20px' }}>
            <CreditCards />
          </div>
        )}

        {/* Installments Tab */}
        {activeTab === 'installments' && (
          <div style={{ marginTop: '20px' }}>
            <Installments />
          </div>
        )}

        {/* Loans Tab */}
        {activeTab === 'loans' && (
          <div style={{ marginTop: '20px' }}>
            <Loans />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditDebt;
