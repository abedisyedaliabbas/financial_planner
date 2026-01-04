import React, { useState, useEffect, useRef } from 'react';
import { dashboardAPI, expensesAPI, incomeAPI, creditCardsAPI, savingsAPI, stocksAPI, bankAccountsAPI } from '../services/api';
import { 
  FaDownload, FaChartLine, FaArrowUp, FaArrowDown, FaExclamationTriangle,
  FaPiggyBank, FaCreditCard, FaBuilding, FaChartBar, FaWallet, FaDollarSign, FaExchangeAlt
} from 'react-icons/fa';
import { getAllCurrencies, getCurrencyName, convertCurrency } from '../utils/currencyConverter';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart 
} from 'recharts';
import ExportButton from '../components/ExportButton';
import { exportToExcel, exportMultipleSheets, downloadChartAsImage } from '../utils/exportUtils';
import { useAuth } from '../context/AuthContext';
import './DashboardEnhanced.css';

const DashboardEnhanced = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [displayCurrency, setDisplayCurrency] = useState(user?.default_currency || 'SGD');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 5, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const chartRefs = {
    expenses: useRef(null),
    income: useRef(null),
    categories: useRef(null),
    trends: useRef(null)
  };

  useEffect(() => {
    if (user?.default_currency) {
      setDisplayCurrency(user.default_currency);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      const [overviewRes, expensesRes, incomeRes] = await Promise.all([
        dashboardAPI.getOverview(),
        expensesAPI.getAll({
          startDate: dateRange.start,
          endDate: dateRange.end
        }),
        incomeAPI.getAll()
      ]);

      // Ensure overview always has data (even if all zeros)
      // Axios wraps responses in .data property
      const overviewData = overviewRes.data || {
        totalBankAccounts: 0,
        bankAccountsCount: 0,
        creditCardsCount: 0,
        totalCreditLimit: 0,
        totalCreditBalance: 0,
        availableCredit: 0,
        savingsCount: 0,
        totalSavings: 0,
        stocksCount: 0,
        totalStocks: 0,
        expensesCount: 0,
        monthlyExpenses: 0,
        incomeCount: 0,
        monthlyIncome: 0,
        activeInstallments: 0,
        netWorth: 0
      };
      
      console.log('Dashboard API Response (raw):', overviewRes);
      console.log('Dashboard Overview Data:', overviewData);

      setOverview(overviewData);
      setExpenses(expensesRes.data || []);
      setIncome(incomeRes.data || []);
      
      // Convert counts to numbers (they might come as strings from SQLite)
      overviewData.bankAccountsCount = Number(overviewData.bankAccountsCount) || 0;
      overviewData.creditCardsCount = Number(overviewData.creditCardsCount) || 0;
      overviewData.savingsCount = Number(overviewData.savingsCount) || 0;
      overviewData.stocksCount = Number(overviewData.stocksCount) || 0;
      overviewData.expensesCount = Number(overviewData.expensesCount) || 0;
      overviewData.incomeCount = Number(overviewData.incomeCount) || 0;
      
      // Debug logging
      console.log('Dashboard Data:', {
        bankAccountsCount: overviewData.bankAccountsCount,
        creditCardsCount: overviewData.creditCardsCount,
        savingsCount: overviewData.savingsCount,
        stocksCount: overviewData.stocksCount,
        expensesCount: overviewData.expensesCount,
        incomeCount: overviewData.incomeCount,
        fullOverview: overviewData
      });
      
      // Process monthly data
      processMonthlyData(expensesRes.data || [], incomeRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Don't set empty overview on error - keep existing data or show error message
      // Only set empty if we truly have no data
      if (!overview) {
        setOverview({
          totalBankAccounts: 0,
          bankAccountsCount: 0,
          creditCardsCount: 0,
          totalCreditLimit: 0,
          totalCreditBalance: 0,
          availableCredit: 0,
          savingsCount: 0,
          totalSavings: 0,
          stocksCount: 0,
          totalStocks: 0,
          expensesCount: 0,
          monthlyExpenses: 0,
          incomeCount: 0,
          monthlyIncome: 0,
          activeInstallments: 0,
          netWorth: 0
        });
      }
      setExpenses([]);
      setIncome([]);
    } finally {
      setLoading(false);
    }
  };

  const processMonthlyData = (expensesData, incomeData) => {
    const months = {};
    
    expensesData.forEach(exp => {
      const month = new Date(exp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!months[month]) {
        months[month] = { month, income: 0, expenses: 0 };
      }
      months[month].expenses += exp.amount;
    });

    incomeData.forEach(inc => {
      const month = new Date(inc.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      if (!months[month]) {
        months[month] = { month, income: 0, expenses: 0 };
      }
      months[month].income += inc.amount;
    });

    setMonthlyData(Object.values(months).sort((a, b) => {
      return new Date(a.month) - new Date(b.month);
    }));
  };

  const formatCurrency = (amount) => {
    // Dashboard data is already in user's default currency from backend, but we can convert to display currency
    const defaultCurrency = user?.default_currency || 'SGD';
    const displayAmount = displayCurrency !== defaultCurrency ? convertCurrency(amount, defaultCurrency, displayCurrency) : amount;
    // Use compact notation for large numbers
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: displayCurrency,
      notation: Math.abs(displayAmount || 0) >= 1000000 ? 'compact' : 'standard',
      maximumFractionDigits: 2
    });
    return formatter.format(displayAmount || 0);
  };

  const categoryExpenses = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const pieData = Object.entries(categoryExpenses)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fbbf24', '#ef4444'];

  const handleExportAll = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to export data');
        return;
      }

      const response = await fetch('/api/export/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to export data' }));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      const sheets = [
        { name: 'Bank Accounts', data: data.bankAccounts || [] },
        { name: 'Credit & Debit', data: data.creditCards || [] },
        { name: 'Expenses', data: data.expenses || [] },
        { name: 'Savings', data: data.savings || [] },
        { name: 'Stocks', data: data.stocks || [] },
        { name: 'Income', data: data.income || [] },
        { name: 'Debit Cards', data: data.debitCards || [] },
        { name: 'Loans', data: data.loans || [] },
        { name: 'Goals', data: data.goals || [] },
        { name: 'Bills', data: data.bills || [] }
      ];

      await exportMultipleSheets(sheets, `financial_report_${new Date().toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting data: ' + (error.message || 'Please try again'));
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    );
  }

  // Show empty state only if there's no data at all (check counts, not balances)
  // Convert to numbers to ensure proper comparison
  const bankCount = Number(overview?.bankAccountsCount) || 0;
  const cardCount = Number(overview?.creditCardsCount) || 0;
  const savingsCount = Number(overview?.savingsCount) || 0;
  const stocksCount = Number(overview?.stocksCount) || 0;
  const expensesCount = Number(overview?.expensesCount) || 0;
  const incomeCount = Number(overview?.incomeCount) || 0;
  
  // Show dashboard if ANY data exists
  const hasAnyData = bankCount > 0 || cardCount > 0 || savingsCount > 0 || 
                     stocksCount > 0 || expensesCount > 0 || incomeCount > 0;
  
  const isEmpty = !overview || !hasAnyData;
  
  // Debug logging
  if (overview) {
    console.log('Empty state check:', {
      isEmpty,
      hasAnyData,
      bankAccountsCount: bankCount,
      creditCardsCount: cardCount,
      savingsCount: savingsCount,
      stocksCount: stocksCount,
      expensesCount: expensesCount,
      incomeCount: incomeCount,
      rawOverview: overview
    });
  }

  if (!overview || isEmpty) {
    return (
      <div className="dashboard-enhanced">
        <div className="dashboard-header">
          <div>
            <h1>Financial Dashboard</h1>
            <p className="dashboard-subtitle">Welcome to your financial tracker!</p>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
          <h2 style={{ marginBottom: '15px', color: '#333' }}>Get Started</h2>
          <p style={{ color: '#666', fontSize: '16px', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px' }}>
            Your dashboard is empty. Start by adding your financial information to see your complete financial overview.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <a href="/bank-accounts" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <FaBuilding /> Add Bank Account
            </a>
            <a href="/income" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <FaChartLine /> Add Income
            </a>
            <a href="/credit-cards" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <FaCreditCard /> Add Credit & Debit
            </a>
            <a href="/expenses" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <FaDollarSign /> Add Expense
            </a>
          </div>
          <div style={{ marginTop: '40px', padding: '20px', background: '#f3f4f6', borderRadius: '8px', maxWidth: '500px', margin: '40px auto 0' }}>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
              <strong>Quick Start:</strong> Add at least one bank account and some income to see your dashboard populate with data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const monthlyBalance = overview.monthlyIncome - overview.monthlyExpenses;
  const savingsRate = overview.monthlyIncome > 0 
    ? ((overview.monthlyIncome - overview.monthlyExpenses) / overview.monthlyIncome * 100).toFixed(1)
    : 0;

  return (
    <div className="dashboard-enhanced">
      <div className="dashboard-header">
        <div>
          <h1>Financial Dashboard</h1>
          <p className="dashboard-subtitle">Complete overview of your financial health</p>
        </div>
        <div className="dashboard-actions" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaExchangeAlt style={{ color: '#667eea' }} />
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
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
          <button className="btn btn-primary" onClick={handleExportAll}>
            <FaDownload /> Export All Data
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="stats-grid-enhanced">
        <div className="stat-card-enhanced primary">
          <div className="stat-icon">
            <FaWallet />
          </div>
          <div className="stat-content">
            <h3>Net Worth</h3>
            <div className="stat-value">{formatCurrency(overview.netWorth)}</div>
            <div className={`stat-change ${overview.netWorth >= 0 ? 'positive' : 'negative'}`}>
              {overview.netWorth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
              Total Assets - Liabilities
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="stat-icon income">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <h3>Monthly Income</h3>
            <div className="stat-value">{formatCurrency(overview.monthlyIncome)}</div>
            <div className="stat-change positive">
              <FaArrowUp /> This month
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="stat-icon expense">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>Monthly Expenses</h3>
            <div className="stat-value">{formatCurrency(overview.monthlyExpenses)}</div>
            <div className="stat-change negative">
              <FaArrowDown /> This month
            </div>
          </div>
        </div>

        <div className={`stat-card-enhanced ${monthlyBalance >= 0 ? 'success' : 'warning'}`}>
          <div className="stat-icon">
            {monthlyBalance >= 0 ? <FaArrowUp /> : <FaExclamationTriangle />}
          </div>
          <div className="stat-content">
            <h3>Monthly Balance</h3>
            <div className="stat-value">{formatCurrency(monthlyBalance)}</div>
            <div className={`stat-change ${monthlyBalance >= 0 ? 'positive' : 'negative'}`}>
              Savings Rate: {savingsRate}%
            </div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="stat-icon">
            <FaBuilding />
          </div>
          <div className="stat-content">
            <h3>Bank Accounts</h3>
            <div className="stat-value">{formatCurrency(overview.totalBankAccounts || 0)}</div>
            <div className="stat-change">Total balance</div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="stat-icon">
            <FaPiggyBank />
          </div>
          <div className="stat-content">
            <h3>Savings</h3>
            <div className="stat-value">{formatCurrency(overview.totalSavings)}</div>
            <div className="stat-change positive">Growing</div>
          </div>
        </div>

        <div className="stat-card-enhanced">
          <div className="stat-icon">
            <FaChartBar />
          </div>
          <div className="stat-content">
            <h3>Stock Portfolio</h3>
            <div className="stat-value">{formatCurrency(overview.totalStocks)}</div>
            <div className="stat-change">Investments</div>
          </div>
        </div>

        <div className="stat-card-enhanced danger">
          <div className="stat-icon">
            <FaCreditCard />
          </div>
          <div className="stat-content">
            <h3>Credit Debt</h3>
            <div className="stat-value">{formatCurrency(overview.totalCreditBalance)}</div>
            <div className="stat-change negative">
              Available: {formatCurrency(overview.availableCredit)}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Income vs Expenses Trend */}
        <div className="chart-card" id="trends-chart">
          <div className="chart-header">
            <h2>Income vs Expenses Trend</h2>
            <ExportButton 
              chartId="trends-chart"
              filename="income_expenses_trend"
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Area type="monotone" dataKey="income" fill="#10b981" fillOpacity={0.3} stroke="#10b981" />
              <Area type="monotone" dataKey="expenses" fill="#ef4444" fillOpacity={0.3} stroke="#ef4444" />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Categories */}
        <div className="chart-card" id="categories-chart">
          <div className="chart-header">
            <h2>Expense Categories</h2>
            <ExportButton 
              chartId="categories-chart"
              filename="expense_categories"
              data={pieData}
            />
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">No expense data available</div>
          )}
        </div>

        {/* Monthly Comparison */}
        <div className="chart-card" id="monthly-comparison">
          <div className="chart-header">
            <h2>Monthly Comparison</h2>
            <ExportButton 
              chartId="monthly-comparison"
              filename="monthly_comparison"
              data={monthlyData}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Health Score */}
        <div className="chart-card">
          <div className="chart-header">
            <h2>Financial Health Score</h2>
          </div>
          <div className="health-score">
            <div className="score-circle">
              <div className="score-value">
                {calculateHealthScore(overview)}
              </div>
              <div className="score-label">/ 100</div>
            </div>
            <div className="score-details">
              <div className="score-item">
                <span>Savings Rate</span>
                <span className={savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'fair' : 'poor'}>
                  {savingsRate}%
                </span>
              </div>
              <div className="score-item">
                <span>Debt to Assets</span>
                <span className={getDebtRatio(overview) < 0.3 ? 'good' : getDebtRatio(overview) < 0.5 ? 'fair' : 'poor'}>
                  {(getDebtRatio(overview) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="score-item">
                <span>Emergency Fund</span>
                <span className={overview.totalSavings >= overview.monthlyExpenses * 3 ? 'good' : 'fair'}>
                  {Math.floor(overview.totalSavings / (overview.monthlyExpenses || 1))} months
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const calculateHealthScore = (overview) => {
  let score = 50; // Base score

  // Savings rate (0-25 points)
  const savingsRate = overview.monthlyIncome > 0 
    ? ((overview.monthlyIncome - overview.monthlyExpenses) / overview.monthlyIncome * 100)
    : 0;
  if (savingsRate >= 20) score += 25;
  else if (savingsRate >= 10) score += 15;
  else if (savingsRate >= 5) score += 10;
  else if (savingsRate > 0) score += 5;

  // Debt ratio (0-25 points)
  const debtRatio = getDebtRatio(overview);
  if (debtRatio < 0.2) score += 25;
  else if (debtRatio < 0.3) score += 20;
  else if (debtRatio < 0.5) score += 10;
  else if (debtRatio < 0.7) score += 5;

  // Emergency fund (0-25 points)
  const emergencyMonths = overview.totalSavings / (overview.monthlyExpenses || 1);
  if (emergencyMonths >= 6) score += 25;
  else if (emergencyMonths >= 3) score += 15;
  else if (emergencyMonths >= 1) score += 10;

  // Net worth positive (0-25 points)
  if (overview.netWorth > 0) score += 25;
  else if (overview.netWorth > -overview.monthlyIncome * 3) score += 10;

  return Math.min(100, Math.max(0, Math.round(score)));
};

const getDebtRatio = (overview) => {
  const totalAssets = (overview.totalBankAccounts || 0) + overview.totalSavings + overview.totalStocks;
  const totalDebt = overview.totalCreditBalance + overview.activeInstallments;
  return totalAssets > 0 ? totalDebt / totalAssets : 0;
};

export default DashboardEnhanced;

