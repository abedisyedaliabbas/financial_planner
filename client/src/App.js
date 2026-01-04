import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AuthGuard from './components/AuthGuard';
import TextSizeControl from './components/TextSizeControl';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import CompleteProfile from './pages/CompleteProfile';
import DashboardEnhanced from './pages/DashboardEnhanced';
import Upgrade from './pages/Upgrade';
import BankAccounts from './pages/BankAccounts';
import CreditCards from './pages/CreditCards';
import CreditDebt from './pages/CreditDebt';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Savings from './pages/Savings';
import Stocks from './pages/Stocks';
import Budget from './pages/Budget';
import FinancialGoals from './pages/FinancialGoals';
import BillReminders from './pages/BillReminders';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route
            path="/complete-profile"
            element={
              <AuthGuard>
                <CompleteProfile />
              </AuthGuard>
            }
          />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <DashboardEnhanced />
              </AuthGuard>
            }
          />
          <Route
            path="/bank-accounts"
            element={
              <AuthGuard>
                <BankAccounts />
              </AuthGuard>
            }
          />
          <Route
            path="/credit-cards"
            element={
              <AuthGuard>
                <CreditDebt defaultTab="credit-cards" />
              </AuthGuard>
            }
          />
          <Route
            path="/credit-debt"
            element={
              <AuthGuard>
                <CreditDebt />
              </AuthGuard>
            }
          />
          <Route
            path="/expenses"
            element={
              <AuthGuard>
                <Expenses />
              </AuthGuard>
            }
          />
          <Route
            path="/income"
            element={
              <AuthGuard>
                <Income />
              </AuthGuard>
            }
          />
          <Route
            path="/savings"
            element={
              <AuthGuard>
                <Savings />
              </AuthGuard>
            }
          />
          <Route
            path="/stocks"
            element={
              <AuthGuard>
                <Stocks />
              </AuthGuard>
            }
          />
          <Route
            path="/budget"
            element={
              <AuthGuard>
                <Budget />
              </AuthGuard>
            }
          />
          <Route
            path="/goals"
            element={
              <AuthGuard>
                <FinancialGoals />
              </AuthGuard>
            }
          />
          <Route
            path="/financial-goals"
            element={
              <AuthGuard>
                <FinancialGoals />
              </AuthGuard>
            }
          />
          <Route
            path="/bills"
            element={
              <AuthGuard>
                <BillReminders />
              </AuthGuard>
            }
          />
          <Route
            path="/bill-reminders"
            element={
              <AuthGuard>
                <BillReminders />
              </AuthGuard>
            }
          />
          <Route
            path="/upgrade"
            element={
              <AuthGuard>
                <Upgrade />
              </AuthGuard>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
      <TextSizeControl />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

