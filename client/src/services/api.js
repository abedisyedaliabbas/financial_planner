import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 429 (rate limit) errors gracefully
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 15;
      console.warn(`Rate limit exceeded. Please wait ${retryAfter} seconds.`);
      // Don't logout on rate limit - just reject the promise
      return Promise.reject(error);
    }
    
    // Only logout on 401 (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  login: (data) => api.post('/auth/login', data),
  googleSignIn: (credential) => api.post('/auth/google', { credential }),
  completeProfile: (data) => api.post('/auth/complete-profile', data),
  getMe: () => api.get('/auth/me'),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
};

// Subscription API
export const subscriptionAPI = {
  getSubscription: () => api.get('/subscription'),
};

// Financial Data API
export const bankAccountsAPI = {
  getAll: () => api.get('/bank-accounts'),
  create: (data) => api.post('/bank-accounts', data),
  update: (id, data) => api.put(`/bank-accounts/${id}`, data),
  delete: (id) => api.delete(`/bank-accounts/${id}`),
};

export const debitCardsAPI = {
  getAll: (params) => api.get('/debit-cards', { params }),
  create: (data) => api.post('/debit-cards', data),
  update: (id, data) => api.put(`/debit-cards/${id}`, data),
  delete: (id) => api.delete(`/debit-cards/${id}`),
};

export const creditCardsAPI = {
  getAll: () => api.get('/credit-cards'),
  create: (data) => api.post('/credit-cards', data),
  update: (id, data) => api.put(`/credit-cards/${id}`, data),
  delete: (id) => api.delete(`/credit-cards/${id}`),
};

export const expensesAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const incomeAPI = {
  getAll: () => api.get('/income'),
  create: (data) => api.post('/income', data),
  update: (id, data) => api.put(`/income/${id}`, data),
  delete: (id) => api.delete(`/income/${id}`),
};

export const financialGoalsAPI = {
  getAll: () => api.get('/financial-goals'),
  create: (data) => api.post('/financial-goals', data),
  update: (id, data) => api.put(`/financial-goals/${id}`, data),
  delete: (id) => api.delete(`/financial-goals/${id}`),
};

export const billRemindersAPI = {
  getAll: () => api.get('/bill-reminders'),
  create: (data) => api.post('/bill-reminders', data),
  update: (id, data) => api.put(`/bill-reminders/${id}`, data),
  delete: (id) => api.delete(`/bill-reminders/${id}`),
};

export const installmentsAPI = {
  getAll: () => api.get('/installments'),
  create: (data) => api.post('/installments', data),
  update: (id, data) => api.put(`/installments/${id}`, data),
  delete: (id) => api.delete(`/installments/${id}`),
};

export const loansAPI = {
  getAll: () => api.get('/loans'),
  create: (data) => api.post('/loans', data),
  update: (id, data) => api.put(`/loans/${id}`, data),
  delete: (id) => api.delete(`/loans/${id}`),
};

export const stocksAPI = {
  getAll: () => api.get('/stocks'),
  create: (data) => api.post('/stocks', data),
  update: (id, data) => api.put(`/stocks/${id}`, data),
  delete: (id) => api.delete(`/stocks/${id}`),
};

export const savingsAPI = {
  getAll: () => api.get('/savings'),
  create: (data) => api.post('/savings', data),
  update: (id, data) => api.put(`/savings/${id}`, data),
  delete: (id) => api.delete(`/savings/${id}`),
  addTransaction: (id, data) => api.post(`/savings/${id}/transactions`, data),
};

export const budgetAPI = {
  getAll: (params) => api.get('/budget', { params }),
  create: (data) => api.post('/budget', data),
  update: (id, data) => api.put(`/budget/${id}`, data),
  delete: (id) => api.delete(`/budget/${id}`),
};

export const dashboardAPI = {
  getOverview: () => api.get('/dashboard'),
};

// Stripe API
export const stripeAPI = {
  createCheckoutSession: (data) => api.post('/stripe/create-checkout-session', data),
  createPortalSession: () => api.post('/stripe/create-portal-session'),
};

export default api;

