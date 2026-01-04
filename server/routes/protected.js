const express = require('express');
const router = express.Router();
const db = require('../database');
const { checkLimit, requireTier, requireFeature } = require('../middleware/subscription');

// Get user subscription info
router.get('/subscription', async (req, res) => {
  try {
    const userId = req.user.id;
    const users = await db.query(
      'SELECT id, email, name, subscription_tier, subscription_status, subscription_expires_at, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    
    // Get usage stats
    const usage = {
      bank_accounts: await checkLimit(userId, 'bank_accounts'),
      credit_cards: await checkLimit(userId, 'credit_cards'),
      expenses_per_month: await checkLimit(userId, 'expenses_per_month'),
      income_per_month: await checkLimit(userId, 'income_per_month'),
      goals: await checkLimit(userId, 'goals'),
      bills: await checkLimit(userId, 'bills')
    };

    res.json({
      subscription: {
        tier: user.subscription_tier || 'free',
        status: user.subscription_status || 'active',
        expires_at: user.subscription_expires_at
      },
      usage
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bank Accounts Routes (with user_id and limit checking)
router.get('/bank-accounts', async (req, res) => {
  try {
    const userId = req.user.id;
    const accounts = await db.query(
      'SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bank-accounts', async (req, res) => {
  try {
    const userId = req.user.id;
    console.log('Creating bank account for user:', userId);
    
    // Check limit
    const limitCheck = await checkLimit(userId, 'bank_accounts');
    console.log('Limit check result:', limitCheck);
    
    if (!limitCheck.allowed) {
      console.log('Limit reached:', limitCheck);
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your free tier limit of ${limitCheck.limit} bank account(s). Upgrade to Premium for unlimited accounts.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { account_name, bank_name, account_number, account_type, country, currency, current_balance, interest_rate } = req.body;
    
    // Validate required fields
    if (!account_name || !bank_name || !country) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Account name, bank name, and country are required' 
      });
    }

    console.log('Inserting bank account:', { userId, account_name, bank_name, country, currency, current_balance });
    
    const result = await db.run(
      'INSERT INTO bank_accounts (user_id, account_name, bank_name, account_number, account_type, country, currency, current_balance, interest_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, account_name, bank_name, account_number || null, account_type || null, country, currency || 'USD', current_balance || 0, interest_rate || null]
    );
    
    console.log('Bank account created successfully:', result.id);
    res.json({ id: result.id, message: 'Bank account added successfully' });
  } catch (error) {
    console.error('Bank account creation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Credit Cards Routes (with user_id and limit checking)
router.get('/credit-cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const cards = await db.query(
      'SELECT * FROM credit_cards WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/credit-cards', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check limit
    const limitCheck = await checkLimit(userId, 'credit_cards');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your free tier limit of ${limitCheck.limit} credit card(s). Upgrade to Premium for unlimited cards.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { name, bank_account_id, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type } = req.body;
    
    // Validate required fields
    if (!name || !country) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Card name and country are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO credit_cards (user_id, name, bank_account_id, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, bank_account_id || null, bank_name || null, country, currency || 'USD', credit_limit || 0, current_balance || 0, interest_rate || null, due_date || null, card_type || 'Credit']
    );
    res.json({ id: result.id, message: 'Credit card added successfully' });
  } catch (error) {
    console.error('Credit card creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Expenses Routes (with user_id and monthly limit checking)
router.get('/expenses', async (req, res) => {
  try {
    const userId = req.user.id;
    const expenses = await db.query(
      `SELECT e.*, 
      c.name as credit_card_name, 
      d.card_name as debit_card_name,
      b.account_name as debit_card_account_name
      FROM expenses e 
      LEFT JOIN credit_cards c ON e.credit_card_id = c.id AND c.user_id = ?
      LEFT JOIN debit_cards d ON e.debit_card_id = d.id AND d.user_id = ?
      LEFT JOIN bank_accounts b ON d.bank_account_id = b.id AND b.user_id = ?
      WHERE e.user_id = ? 
      ORDER BY e.date DESC, e.created_at DESC`,
      [userId, userId, userId, userId]
    );
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check monthly limit
    const limitCheck = await checkLimit(userId, 'expenses_per_month');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Monthly limit reached',
        message: `You've reached your monthly limit of ${limitCheck.limit} expenses. Upgrade to Premium for unlimited expenses.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { category, description, amount, currency, payment_method, credit_card_id, debit_card_id, date } = req.body;
    
    // Validate required fields
    if (!category || !amount) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Category and amount are required' 
      });
    }

    const creditCardId = credit_card_id && credit_card_id !== '' ? credit_card_id : null;
    const debitCardId = debit_card_id && debit_card_id !== '' ? debit_card_id : null;
    
    // Verify cards belong to user if provided
    if (creditCardId) {
      const card = await db.query('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [creditCardId, userId]);
      if (!card || card.length === 0) {
        return res.status(404).json({ error: 'Credit card not found' });
      }
    }
    
    if (debitCardId) {
      const card = await db.query('SELECT * FROM debit_cards WHERE id = ? AND user_id = ?', [debitCardId, userId]);
      if (!card || card.length === 0) {
        return res.status(404).json({ error: 'Debit card not found' });
      }
    }

    const result = await db.run(
      'INSERT INTO expenses (user_id, category, description, amount, currency, payment_method, credit_card_id, debit_card_id, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, category, description || null, amount, currency || 'USD', payment_method || null, creditCardId, debitCardId, date || new Date().toISOString().split('T')[0]]
    );
    
    // Update credit card balance if paid with credit card
    if (creditCardId) {
      await db.run('UPDATE credit_cards SET current_balance = current_balance + ? WHERE id = ? AND user_id = ?', [amount, creditCardId, userId]);
    }
    
    // Update bank account balance if paid with debit card
    if (debitCardId) {
      const debitCard = await db.query('SELECT bank_account_id FROM debit_cards WHERE id = ? AND user_id = ?', [debitCardId, userId]);
      if (debitCard.length > 0) {
        await db.run('UPDATE bank_accounts SET current_balance = current_balance - ? WHERE id = ? AND user_id = ?', [amount, debitCard[0].bank_account_id, userId]);
      }
    }
    res.json({ id: result.id, message: 'Expense added successfully' });
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Income Routes (with user_id and monthly limit checking)
router.get('/income', async (req, res) => {
  try {
    const userId = req.user.id;
    const income = await db.query(
      'SELECT * FROM income WHERE user_id = ? ORDER BY date DESC, created_at DESC',
      [userId]
    );
    res.json(income);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/income', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check monthly limit
    const limitCheck = await checkLimit(userId, 'income_per_month');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Monthly limit reached',
        message: `You've reached your monthly limit of ${limitCheck.limit} income entries. Upgrade to Premium for unlimited entries.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { amount, currency, income_type, frequency, bank_account_id, description, date, source } = req.body;
    
    // Validate required fields
    if (!amount) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Amount is required' 
      });
    }

    const result = await db.run(
      'INSERT INTO income (user_id, amount, currency, income_type, frequency, bank_account_id, description, date, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, amount, currency || 'USD', income_type || null, frequency || null, bank_account_id || null, description || null, date || new Date().toISOString().split('T')[0], source || null]
    );
    res.json({ id: result.id, message: 'Income added successfully' });
  } catch (error) {
    console.error('Income creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Financial Goals Routes (with user_id and limit checking)
router.get('/financial-goals', async (req, res) => {
  try {
    const userId = req.user.id;
    const goals = await db.query(
      'SELECT * FROM financial_goals WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/financial-goals', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check limit
    const limitCheck = await checkLimit(userId, 'goals');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your free tier limit of ${limitCheck.limit} goal(s). Upgrade to Premium for unlimited goals.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { name, goal_type, target_amount, current_amount, target_date, priority, status, description } = req.body;
    
    // Validate required fields
    if (!name || !target_amount) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name and target amount are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO financial_goals (user_id, name, goal_type, target_amount, current_amount, target_date, priority, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, goal_type || null, target_amount, current_amount || 0, target_date || null, priority || 'medium', status || 'active', description || null]
    );
    res.json({ id: result.id, message: 'Financial goal added successfully' });
  } catch (error) {
    console.error('Financial goal creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Bill Reminders Routes (with user_id and limit checking)
router.get('/bill-reminders', async (req, res) => {
  try {
    const userId = req.user.id;
    const bills = await db.query(
      'SELECT * FROM bill_reminders WHERE user_id = ? ORDER BY due_date ASC',
      [userId]
    );
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/bill-reminders', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Check limit
    const limitCheck = await checkLimit(userId, 'bills');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your free tier limit of ${limitCheck.limit} bill reminder(s). Upgrade to Premium for unlimited reminders.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }

    const { name, amount, due_date, frequency, category, is_paid, credit_card_id, bank_account_id, notes } = req.body;
    
    // Validate required fields
    if (!name || !amount || !due_date) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Name, amount, and due date are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO bill_reminders (user_id, name, amount, due_date, frequency, category, is_paid, credit_card_id, bank_account_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, amount, due_date, frequency || 'monthly', category || null, is_paid ? 1 : 0, credit_card_id || null, bank_account_id || null, notes || null]
    );
    res.json({ id: result.id, message: 'Bill reminder added successfully' });
  } catch (error) {
    console.error('Bill reminder creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Savings Routes (with user_id)
router.get('/savings', async (req, res) => {
  try {
    const userId = req.user.id;
    const savings = await db.query(
      'SELECT * FROM savings WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(savings);
  } catch (error) {
    console.error('Get savings error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/savings', async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bank_account_id, account_type, current_balance, interest_rate, goal_amount, target_date, currency } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Account name is required' 
      });
    }

    const result = await db.run(
      'INSERT INTO savings (user_id, account_name, bank_account_id, account_type, current_balance, interest_rate, goal_amount, target_date, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, name, bank_account_id || null, account_type || null, current_balance || 0, interest_rate || null, goal_amount || null, target_date || null, currency || 'USD']
    );
    res.json({ id: result.id, message: 'Savings account added successfully' });
  } catch (error) {
    console.error('Savings creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/savings/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, bank_account_id, account_type, current_balance, interest_rate, goal_amount, target_date, currency } = req.body;
    
    await db.run(
      'UPDATE savings SET account_name = ?, bank_account_id = ?, account_type = ?, current_balance = ?, interest_rate = ?, goal_amount = ?, target_date = ?, currency = ? WHERE id = ? AND user_id = ?',
      [name, bank_account_id || null, account_type || null, current_balance || 0, interest_rate || null, goal_amount || null, target_date || null, currency || 'USD', id, userId]
    );
    res.json({ message: 'Savings account updated successfully' });
  } catch (error) {
    console.error('Savings update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/savings/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM savings WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Savings account deleted successfully' });
  } catch (error) {
    console.error('Savings delete error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add transaction to savings
router.post('/savings/:id/transactions', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, transaction_type, description, date } = req.body;
    
    // Validate required fields
    if (!amount || !transaction_type) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Amount and transaction type are required' 
      });
    }

    // Get current balance
    const savings = await db.query('SELECT current_balance FROM savings WHERE id = ? AND user_id = ?', [id, userId]);
    if (!savings || savings.length === 0) {
      return res.status(404).json({ error: 'Savings account not found' });
    }

    const currentBalance = savings[0].current_balance || 0;
    const newBalance = transaction_type === 'deposit' 
      ? currentBalance + parseFloat(amount)
      : currentBalance - parseFloat(amount);

    // Update balance
    await db.run('UPDATE savings SET current_balance = ? WHERE id = ? AND user_id = ?', [newBalance, id, userId]);
    
    res.json({ message: 'Transaction added successfully', newBalance });
  } catch (error) {
    console.error('Savings transaction error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Stocks Routes (Premium only)
router.get('/stocks', requireFeature('stocks'), async (req, res) => {
  try {
    const userId = req.user.id;
    const stocks = await db.query(
      'SELECT * FROM stocks WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(stocks);
  } catch (error) {
    console.error('Get stocks error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/stocks', requireTier('premium'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, shares, purchase_price, current_price, currency, purchase_date, company_name } = req.body;
    
    // Validate required fields
    if (!symbol || !shares || !purchase_price) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Symbol, shares, and purchase price are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO stocks (user_id, symbol, shares, purchase_price, current_price, currency, purchase_date, company_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, symbol, shares || 0, purchase_price, current_price || purchase_price || 0, currency || 'USD', purchase_date || null, company_name || null]
    );
    res.json({ id: result.id, message: 'Stock added successfully' });
  } catch (error) {
    console.error('Stock creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Dashboard Route (with user_id filtering)
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's default currency
    const user = await db.get('SELECT default_currency FROM users WHERE id = ?', [userId]);
    const defaultCurrency = user?.default_currency || 'USD';
    
    // Currency conversion function (matching frontend logic)
    // Converts to USD first, then to target currency
    const EXCHANGE_RATES = {
      USD: 1,
      PKR: 278.5,
      SGD: 1.35,
      EUR: 0.92,
      GBP: 0.79,
      AED: 3.67,
      SAR: 3.75,
      INR: 83.0,
      MYR: 4.75,
      THB: 36.0,
      IDR: 15700,
      PHP: 56.0,
      CNY: 7.2,
      JPY: 150.0,
      KRW: 1330,
      HKD: 7.8,
      CAD: 1.35,
      AUD: 1.52,
      CHF: 0.88,
      SEK: 10.5,
      NOK: 10.8,
      DKK: 6.85,
      PLN: 4.0,
      BRL: 4.95,
      MXN: 17.0,
      ARS: 850,
      CLP: 950,
      ZAR: 18.5,
      EGP: 31.0,
      NGN: 1600
    };
    
    const convertToDefault = (amount, fromCurrency, toCurrency = defaultCurrency) => {
      if (!amount || amount === 0) return 0;
      if (fromCurrency === toCurrency) return amount;
      
      const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
      const toRate = EXCHANGE_RATES[toCurrency] || 1;
      
      // Convert to USD first, then to target currency (matching frontend logic)
      const usdAmount = amount / fromRate;
      const convertedAmount = usdAmount * toRate;
      
      return convertedAmount;
    };
    
    // Get all user's data with counts
    const bankAccounts = await db.query('SELECT current_balance, currency FROM bank_accounts WHERE user_id = ?', [userId]);
    const creditCards = await db.query('SELECT credit_limit, current_balance, currency FROM credit_cards WHERE user_id = ?', [userId]);
    const savings = await db.query('SELECT current_balance, currency FROM savings WHERE user_id = ?', [userId]);
    const stocks = await db.query('SELECT shares, current_price, purchase_price, currency FROM stocks WHERE user_id = ?', [userId]);
    
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    const expenses = await db.query(
      'SELECT amount, currency FROM expenses WHERE user_id = ? AND date >= ? AND date <= ?',
      [userId, monthStart, monthEnd]
    );
    
    const income = await db.query(
      'SELECT amount, currency FROM income WHERE user_id = ? AND date >= ? AND date <= ?',
      [userId, monthStart, monthEnd]
    );

    // Get installments with currency
    const installments = await db.query(
      'SELECT remaining_amount, monthly_payment, currency FROM installments WHERE user_id = ? AND status = ?',
      [userId, 'active']
    );

    // Calculate totals with currency conversion
    const totalBankAccounts = bankAccounts.reduce((sum, acc) => {
      const amount = acc.current_balance || 0;
      const currency = acc.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const totalCreditLimit = creditCards.reduce((sum, card) => {
      const amount = card.credit_limit || 0;
      const currency = card.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const totalCreditBalance = creditCards.reduce((sum, card) => {
      const amount = card.current_balance || 0;
      const currency = card.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const totalSavings = savings.reduce((sum, saving) => {
      const amount = saving.current_balance || 0;
      const currency = saving.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const totalStocks = stocks.reduce((sum, stock) => {
      const price = stock.current_price || stock.purchase_price || 0;
      const shares = stock.shares || 0;
      const amount = price * shares;
      const currency = stock.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const monthlyExpenses = expenses.reduce((sum, exp) => {
      const amount = exp.amount || 0;
      const currency = exp.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const monthlyIncome = income.reduce((sum, inc) => {
      const amount = inc.amount || 0;
      const currency = inc.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);
    
    const activeInstallments = installments.reduce((sum, inst) => {
      const amount = inst.remaining_amount || 0;
      const currency = inst.currency || defaultCurrency;
      return sum + convertToDefault(amount, currency, defaultCurrency);
    }, 0);

    const availableCredit = totalCreditLimit - totalCreditBalance;
    const netWorth = totalBankAccounts + totalSavings + totalStocks - totalCreditBalance - activeInstallments;

    res.json({
      totalBankAccounts,
      bankAccountsCount: bankAccounts.length,
      creditCardsCount: creditCards.length,
      totalCreditLimit,
      totalCreditBalance,
      availableCredit,
      savingsCount: savings.length,
      totalSavings,
      stocksCount: stocks.length,
      totalStocks,
      expensesCount: expenses.length,
      monthlyExpenses,
      incomeCount: income.length,
      monthlyIncome,
      activeInstallments,
      netWorth,
      monthlyBalance: monthlyIncome - monthlyExpenses,
      defaultCurrency // Include default currency in response
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update and Delete routes for Bank Accounts
router.put('/bank-accounts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { account_name, bank_name, account_number, account_type, country, currency, current_balance, interest_rate } = req.body;
    
    await db.run(
      'UPDATE bank_accounts SET account_name = ?, bank_name = ?, account_number = ?, account_type = ?, country = ?, currency = ?, current_balance = ?, interest_rate = ? WHERE id = ? AND user_id = ?',
      [account_name, bank_name, account_number, account_type, country, currency, current_balance, interest_rate, id, userId]
    );
    res.json({ message: 'Bank account updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debit Cards Routes (with user_id)
router.get('/debit-cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { bank_account_id } = req.query;
    let sql = `
      SELECT d.*, b.account_name, b.bank_name, b.currency as account_currency
      FROM debit_cards d
      LEFT JOIN bank_accounts b ON d.bank_account_id = b.id
      WHERE d.user_id = ?
    `;
    const params = [userId];
    
    if (bank_account_id) {
      sql += ' AND d.bank_account_id = ?';
      params.push(bank_account_id);
    }
    
    sql += ' ORDER BY d.created_at DESC';
    
    const cards = await db.query(sql, params);
    res.json(cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/debit-cards', async (req, res) => {
  try {
    const userId = req.user.id;
    const { bank_account_id, card_name, card_number, expiry_date, currency, daily_limit, status } = req.body;
    
    // Verify bank account belongs to user
    const account = await db.query('SELECT * FROM bank_accounts WHERE id = ? AND user_id = ?', [bank_account_id, userId]);
    if (!account || account.length === 0) {
      return res.status(404).json({ error: 'Bank account not found' });
    }
    
    // Check subscription limit for total debit cards
    const limitCheck = await checkLimit(userId, 'debit_cards');
    if (!limitCheck.allowed) {
      return res.status(403).json({
        error: 'Limit reached',
        message: `You've reached your free tier limit of ${limitCheck.limit} debit card(s). Upgrade to Premium for unlimited cards.`,
        current: limitCheck.current,
        limit: limitCheck.limit,
        upgradeUrl: '/upgrade'
      });
    }
    
    // Check if bank account already has 5 debit cards (per-account limit)
    const existingCards = await db.query('SELECT COUNT(*) as count FROM debit_cards WHERE bank_account_id = ? AND user_id = ?', [bank_account_id, userId]);
    const accountCardCount = Number(existingCards[0]?.count) || 0;
    if (accountCardCount >= 5) {
      return res.status(400).json({ error: 'Maximum 5 debit cards allowed per bank account' });
    }
    
    // Get currency from bank account if not provided
    let cardCurrency = currency;
    if (!cardCurrency) {
      cardCurrency = account[0].currency || 'USD';
    }
    
    const result = await db.run(
      'INSERT INTO debit_cards (user_id, bank_account_id, card_name, card_number, expiry_date, currency, daily_limit, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, bank_account_id, card_name, card_number || null, expiry_date || null, cardCurrency || 'USD', daily_limit || null, status || 'active']
    );
    res.json({ id: result.id, message: 'Debit card added successfully' });
  } catch (error) {
    console.error('Error creating debit card:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/debit-cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { bank_account_id, card_name, card_number, expiry_date, currency, daily_limit, status } = req.body;
    
    // Verify card belongs to user
    const card = await db.query('SELECT * FROM debit_cards WHERE id = ? AND user_id = ?', [id, userId]);
    if (!card || card.length === 0) {
      return res.status(404).json({ error: 'Debit card not found' });
    }
    
    await db.run(
      'UPDATE debit_cards SET bank_account_id = ?, card_name = ?, card_number = ?, expiry_date = ?, currency = ?, daily_limit = ?, status = ? WHERE id = ? AND user_id = ?',
      [bank_account_id, card_name, card_number || null, expiry_date || null, currency || 'USD', daily_limit || null, status || 'active', id, userId]
    );
    res.json({ message: 'Debit card updated successfully' });
  } catch (error) {
    console.error('Error updating debit card:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/debit-cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    
    // Verify card belongs to user
    const card = await db.query('SELECT * FROM debit_cards WHERE id = ? AND user_id = ?', [id, userId]);
    if (!card || card.length === 0) {
      return res.status(404).json({ error: 'Debit card not found' });
    }
    
    await db.run('DELETE FROM debit_cards WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Debit card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/bank-accounts/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM bank_accounts WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update and Delete routes for Credit Cards
router.put('/credit-cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, bank_account_id, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type } = req.body;
    
    await db.run(
      'UPDATE credit_cards SET name = ?, bank_account_id = ?, bank_name = ?, country = ?, currency = ?, credit_limit = ?, current_balance = ?, interest_rate = ?, due_date = ?, card_type = ? WHERE id = ? AND user_id = ?',
      [name, bank_account_id || null, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type, id, userId]
    );
    res.json({ message: 'Credit card updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/credit-cards/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM credit_cards WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Credit card deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update and Delete routes for Expenses
router.put('/expenses/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category, description, amount, currency, payment_method, credit_card_id, debit_card_id, date } = req.body;
    
    // Get old expense to revert changes
    const oldExpense = await db.query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    
    if (oldExpense.length > 0) {
      const old = oldExpense[0];
      // Revert old credit card balance if needed
      if (old.credit_card_id) {
        await db.run('UPDATE credit_cards SET current_balance = current_balance - ? WHERE id = ? AND user_id = ?', [old.amount, old.credit_card_id, userId]);
      }
      // Revert old debit card balance if needed
      if (old.debit_card_id) {
        const oldDebitCard = await db.query('SELECT bank_account_id FROM debit_cards WHERE id = ? AND user_id = ?', [old.debit_card_id, userId]);
        if (oldDebitCard.length > 0) {
          await db.run('UPDATE bank_accounts SET current_balance = current_balance + ? WHERE id = ? AND user_id = ?', [old.amount, oldDebitCard[0].bank_account_id, userId]);
        }
      }
    }
    
    const creditCardId = credit_card_id && credit_card_id !== '' ? credit_card_id : null;
    const debitCardId = debit_card_id && debit_card_id !== '' ? debit_card_id : null;
    
    // Verify cards belong to user if provided
    if (creditCardId) {
      const card = await db.query('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?', [creditCardId, userId]);
      if (!card || card.length === 0) {
        return res.status(404).json({ error: 'Credit card not found' });
      }
    }
    
    if (debitCardId) {
      const card = await db.query('SELECT * FROM debit_cards WHERE id = ? AND user_id = ?', [debitCardId, userId]);
      if (!card || card.length === 0) {
        return res.status(404).json({ error: 'Debit card not found' });
      }
    }
    
    await db.run(
      'UPDATE expenses SET category = ?, description = ?, amount = ?, currency = ?, payment_method = ?, credit_card_id = ?, debit_card_id = ?, date = ? WHERE id = ? AND user_id = ?',
      [category, description, amount, currency, payment_method, creditCardId, debitCardId, date, id, userId]
    );
    
    // Apply new credit card balance if needed
    if (creditCardId) {
      await db.run('UPDATE credit_cards SET current_balance = current_balance + ? WHERE id = ? AND user_id = ?', [amount, creditCardId, userId]);
    }
    
    // Apply new debit card balance if needed
    if (debitCardId) {
      const debitCard = await db.query('SELECT bank_account_id FROM debit_cards WHERE id = ? AND user_id = ?', [debitCardId, userId]);
      if (debitCard.length > 0) {
        await db.run('UPDATE bank_accounts SET current_balance = current_balance - ? WHERE id = ? AND user_id = ?', [amount, debitCard[0].bank_account_id, userId]);
      }
    }
    
    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/expenses/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const expense = await db.query('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    if (expense.length > 0) {
      // Revert credit card balance if needed
      if (expense[0].credit_card_id) {
        await db.run('UPDATE credit_cards SET current_balance = current_balance - ? WHERE id = ? AND user_id = ?', [expense[0].amount, expense[0].credit_card_id, userId]);
      }
      // Revert debit card balance if needed
      if (expense[0].debit_card_id) {
        const debitCard = await db.query('SELECT bank_account_id FROM debit_cards WHERE id = ? AND user_id = ?', [expense[0].debit_card_id, userId]);
        if (debitCard.length > 0) {
          await db.run('UPDATE bank_accounts SET current_balance = current_balance + ? WHERE id = ? AND user_id = ?', [expense[0].amount, debitCard[0].bank_account_id, userId]);
        }
      }
      await db.run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update and Delete routes for Income
router.put('/income/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, currency, income_type, frequency, bank_account_id, description, date, source } = req.body;
    
    await db.run(
      'UPDATE income SET amount = ?, currency = ?, income_type = ?, frequency = ?, bank_account_id = ?, description = ?, date = ?, source = ? WHERE id = ? AND user_id = ?',
      [amount, currency, income_type, frequency, bank_account_id || null, description, date, source, id, userId]
    );
    res.json({ message: 'Income updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/income/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM income WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update and Delete routes for Financial Goals
router.put('/financial-goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, goal_type, target_amount, current_amount, target_date, priority, status, description } = req.body;
    
    await db.run(
      'UPDATE financial_goals SET name = ?, goal_type = ?, target_amount = ?, current_amount = ?, target_date = ?, priority = ?, status = ?, description = ? WHERE id = ? AND user_id = ?',
      [name, goal_type, target_amount, current_amount, target_date, priority, status, description, id, userId]
    );
    res.json({ message: 'Financial goal updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/financial-goals/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM financial_goals WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Financial goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update and Delete routes for Bill Reminders
router.put('/bill-reminders/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, amount, due_date, frequency, category, is_paid, credit_card_id, bank_account_id, notes, last_paid_date } = req.body;
    
    await db.run(
      'UPDATE bill_reminders SET name = ?, amount = ?, due_date = ?, frequency = ?, category = ?, is_paid = ?, credit_card_id = ?, bank_account_id = ?, notes = ?, last_paid_date = ? WHERE id = ? AND user_id = ?',
      [name, amount, due_date, frequency, category, is_paid ? 1 : 0, credit_card_id || null, bank_account_id || null, notes, last_paid_date || null, id, userId]
    );
    res.json({ message: 'Bill reminder updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/bill-reminders/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM bill_reminders WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Bill reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Budget Routes (Premium feature)
router.get('/budget', requireFeature('budget'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();
    
    const budgets = await db.query(
      'SELECT * FROM budget WHERE user_id = ? AND month = ? AND year = ? ORDER BY created_at DESC',
      [userId, currentMonth, currentYear]
    );
    res.json(budgets);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/budget', requireFeature('budget'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { category, monthly_limit, month, year } = req.body;
    
    // Validate required fields
    if (!category || !monthly_limit || !month || !year) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Category, monthly limit, month, and year are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO budget (user_id, category, monthly_limit, month, year) VALUES (?, ?, ?, ?, ?)',
      [userId, category, monthly_limit, month, year]
    );
    res.json({ id: result.id, message: 'Budget added successfully' });
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/budget/:id', requireFeature('budget'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { category, monthly_limit, month, year } = req.body;
    
    await db.run(
      'UPDATE budget SET category = ?, monthly_limit = ?, month = ?, year = ? WHERE id = ? AND user_id = ?',
      [category, monthly_limit, month, year, id, userId]
    );
    res.json({ message: 'Budget updated successfully' });
  } catch (error) {
    console.error('Budget update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/budget/:id', requireFeature('budget'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM budget WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    console.error('Budget delete error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Installments Routes
router.get('/installments', async (req, res) => {
  try {
    const userId = req.user.id;
    const installments = await db.query(
      `SELECT i.*, c.name as card_name 
       FROM installments i 
       LEFT JOIN credit_cards c ON i.credit_card_id = c.id 
       WHERE i.user_id = ? 
       ORDER BY i.created_at DESC`,
      [userId]
    );
    res.json(installments);
  } catch (error) {
    console.error('Get installments error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/installments', async (req, res) => {
  try {
    const userId = req.user.id;
    const { credit_card_id, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date, status, currency } = req.body;
    
    // Validate required fields
    if (!description || !total_amount || !monthly_payment) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Description, total amount, and monthly payment are required' 
      });
    }

    const result = await db.run(
      'INSERT INTO installments (user_id, credit_card_id, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date, status, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, credit_card_id || null, description, total_amount, remaining_amount || total_amount, monthly_payment, interest_rate || null, start_date || null, end_date || null, status || 'active', currency || 'USD']
    );
    res.json({ id: result.id, message: 'Installment added successfully' });
  } catch (error) {
    console.error('Installment creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/installments/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { credit_card_id, description, total_amount, remaining_amount, monthly_payment, interest_rate, start_date, end_date, status, currency } = req.body;
    
    await db.run(
      'UPDATE installments SET credit_card_id = ?, description = ?, total_amount = ?, remaining_amount = ?, monthly_payment = ?, interest_rate = ?, start_date = ?, end_date = ?, status = ?, currency = ? WHERE id = ? AND user_id = ?',
      [credit_card_id || null, description, total_amount, remaining_amount, monthly_payment, interest_rate || null, start_date || null, end_date || null, status, currency || 'USD', id, userId]
    );
    res.json({ message: 'Installment updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/installments/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM installments WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Installment deleted successfully' });
  } catch (error) {
    console.error('Installment delete error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Loans Routes
router.get('/loans', async (req, res) => {
  try {
    const userId = req.user.id;
    const loans = await db.query(
      `SELECT l.*, 
       c.name as card_name,
       b.account_name as bank_account_name
       FROM loans l 
       LEFT JOIN credit_cards c ON l.credit_card_id = c.id 
       LEFT JOIN bank_accounts b ON l.bank_account_id = b.id
       WHERE l.user_id = ? 
       ORDER BY l.created_at DESC`,
      [userId]
    );
    res.json(loans);
  } catch (error) {
    console.error('Get loans error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.post('/loans', async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      loan_name, 
      loan_type, 
      lender_name, 
      credit_card_id, 
      bank_account_id,
      principal_amount, 
      remaining_balance, 
      monthly_payment, 
      interest_rate, 
      currency,
      start_date, 
      end_date, 
      payment_day,
      status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!loan_name || !loan_type || !principal_amount || !remaining_balance || !monthly_payment) {
      return res.status(400).json({ 
        error: 'Missing required fields', 
        message: 'Loan name, type, principal amount, remaining balance, and monthly payment are required' 
      });
    }

    const result = await db.run(
      `INSERT INTO loans (
        user_id, loan_name, loan_type, lender_name, credit_card_id, bank_account_id,
        principal_amount, remaining_balance, monthly_payment, interest_rate, currency,
        start_date, end_date, payment_day, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, loan_name, loan_type || 'Personal', lender_name || null, 
        credit_card_id || null, bank_account_id || null,
        principal_amount, remaining_balance, monthly_payment, 
        interest_rate || null, currency || 'USD',
        start_date || null, end_date || null, payment_day || null,
        status || 'active', notes || null
      ]
    );
    res.json({ id: result.id, message: 'Loan added successfully' });
  } catch (error) {
    console.error('Loan creation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.put('/loans/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { 
      loan_name, 
      loan_type, 
      lender_name, 
      credit_card_id, 
      bank_account_id,
      principal_amount, 
      remaining_balance, 
      monthly_payment, 
      interest_rate, 
      currency,
      start_date, 
      end_date, 
      payment_day,
      status,
      notes
    } = req.body;
    
    await db.run(
      `UPDATE loans SET 
        loan_name = ?, loan_type = ?, lender_name = ?, credit_card_id = ?, bank_account_id = ?,
        principal_amount = ?, remaining_balance = ?, monthly_payment = ?, interest_rate = ?, currency = ?,
        start_date = ?, end_date = ?, payment_day = ?, status = ?, notes = ?
       WHERE id = ? AND user_id = ?`,
      [
        loan_name, loan_type, lender_name, credit_card_id, bank_account_id,
        principal_amount, remaining_balance, monthly_payment, interest_rate, currency,
        start_date, end_date, payment_day, status, notes,
        id, userId
      ]
    );
    res.json({ message: 'Loan updated successfully' });
  } catch (error) {
    console.error('Loan update error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.delete('/loans/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM loans WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Loan delete error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Update and Delete routes for Stocks
router.put('/stocks/:id', requireTier('premium'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { symbol, shares, purchase_price, current_price, currency, purchase_date } = req.body;
    
    await db.run(
      'UPDATE stocks SET symbol = ?, shares = ?, purchase_price = ?, current_price = ?, currency = ?, purchase_date = ? WHERE id = ? AND user_id = ?',
      [symbol, shares, purchase_price, current_price, currency, purchase_date, id, userId]
    );
    res.json({ message: 'Stock updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/stocks/:id', requireTier('premium'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    await db.run('DELETE FROM stocks WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export all data endpoint
router.get('/export/all', async (req, res) => {
  try {
    const userId = req.user.id;
    
    const [bankAccounts, creditCards, expenses, savings, stocks, income] = await Promise.all([
      db.all('SELECT * FROM bank_accounts WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM credit_cards WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM expenses WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM savings WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM stocks WHERE user_id = ?', [userId]),
      db.all('SELECT * FROM income WHERE user_id = ?', [userId])
    ]);
    
    res.json({
      bankAccounts,
      creditCards,
      expenses,
      savings,
      stocks,
      income
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

