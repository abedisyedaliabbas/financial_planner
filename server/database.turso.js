// Turso (Serverless SQLite) Database Configuration
// This is a drop-in replacement for SQLite that works with Vercel
const { createClient } = require('@libsql/client');
const path = require('path');

let db = null;

const init = async () => {
  try {
    // Check if we're using Turso (production) or local SQLite (development)
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (tursoUrl && tursoToken) {
      // Use Turso (production)
      console.log('📦 Using Turso (Serverless SQLite)');
      console.log('   Database URL:', tursoUrl.replace(/\/\/.*@/, '//***@')); // Hide credentials
      db = createClient({
        url: tursoUrl,
        authToken: tursoToken
      });
      
      // Test connection
      try {
        await db.execute('SELECT 1');
        console.log('✅ Connected to Turso database');
      } catch (err) {
        console.error('❌ Failed to connect to Turso:', err.message);
        throw err;
      }
    } else {
      // Fallback to local SQLite for development
      console.log('📦 Using local SQLite (development mode)');
      console.log('   (Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to use Turso)');
      const sqlite3 = require('sqlite3').verbose();
      const dbPath = path.join(__dirname, 'financial_tracker.db');
      const fs = require('fs');
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      
      return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
          if (err) {
            console.error('❌ Error opening database:', err);
            reject(err);
            return;
          }
          console.log('✅ Connected to local SQLite database:', dbPath);
          
          // Enable foreign keys for SQLite
          db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.warn('⚠️  Warning: Could not enable foreign keys:', err);
            } else {
              console.log('✓ Foreign keys enabled');
            }
          });
          
          // Create tables
          createTables().then(() => {
            resolve();
          }).catch(reject);
        });
      });
    }
    
    // Create tables for Turso
    await createTables();
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

const createTables = async () => {
  // Users table
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    mobile_number TEXT,
    country TEXT,
    default_currency TEXT DEFAULT 'USD',
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    subscription_expires_at DATETIME,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    email_verified INTEGER DEFAULT 0,
    email_verified_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // Email Verifications table
  await run(`CREATE TABLE IF NOT EXISTS email_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Password Resets table
  await run(`CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Bank Accounts
  await run(`CREATE TABLE IF NOT EXISTS bank_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    bank_name TEXT NOT NULL,
    account_number TEXT,
    account_type TEXT,
    country TEXT NOT NULL,
    currency TEXT DEFAULT 'USD',
    current_balance REAL DEFAULT 0,
    interest_rate REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Credit Cards
  await run(`CREATE TABLE IF NOT EXISTS credit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    bank_account_id INTEGER,
    bank_name TEXT,
    country TEXT,
    currency TEXT,
    credit_limit REAL,
    current_balance REAL DEFAULT 0,
    interest_rate REAL,
    due_date INTEGER,
    card_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);
  
  // Debit Cards
  await run(`CREATE TABLE IF NOT EXISTS debit_cards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bank_account_id INTEGER NOT NULL,
    card_name TEXT NOT NULL,
    card_number TEXT,
    expiry_date TEXT,
    currency TEXT,
    daily_limit REAL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);
  
  // Expenses
  await run(`CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    payment_method TEXT,
    credit_card_id INTEGER,
    debit_card_id INTEGER,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id),
    FOREIGN KEY (debit_card_id) REFERENCES debit_cards(id)
  )`);
  
  // Income
  await run(`CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    income_type TEXT NOT NULL,
    description TEXT,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Savings
  await run(`CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    goal_name TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    target_date TEXT,
    bank_account_id INTEGER,
    currency TEXT DEFAULT 'USD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);
  
  // Installments
  await run(`CREATE TABLE IF NOT EXISTS installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    credit_card_id INTEGER NOT NULL,
    installment_name TEXT NOT NULL,
    total_amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id)
  )`);
  
  // Loans
  await run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    loan_name TEXT NOT NULL,
    loan_type TEXT,
    principal_amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    interest_rate REAL,
    monthly_payment REAL,
    currency TEXT DEFAULT 'USD',
    start_date TEXT NOT NULL,
    end_date TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Financial Goals
  await run(`CREATE TABLE IF NOT EXISTS financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    goal_type TEXT,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    target_date TEXT,
    priority TEXT,
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Bill Reminders
  await run(`CREATE TABLE IF NOT EXISTS bill_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    bill_name TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    due_date TEXT NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    category TEXT,
    is_paid INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Stocks
  await run(`CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    shares REAL NOT NULL,
    purchase_price REAL NOT NULL,
    current_price REAL,
    currency TEXT DEFAULT 'USD',
    purchase_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
  // Recurring Transactions
  await run(`CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    frequency TEXT NOT NULL,
    next_date TEXT NOT NULL,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
  
    console.log('✅ Database tables created');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
};

// Promise wrapper for database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized. Please wait for database to be ready.'));
      return;
    }
    
    // Turso uses async/await, SQLite uses callbacks
    if (typeof db.execute === 'function') {
      // Turso client
      db.execute(sql, params)
        .then(result => resolve(result.rows || []))
        .catch(reject);
    } else {
      // SQLite
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    }
  });
};

const get = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized. Please wait for database to be ready.'));
      return;
    }
    
    if (typeof db.execute === 'function') {
      // Turso client
      db.execute(sql, params)
        .then(result => {
          const rows = result.rows || [];
          resolve(rows.length > 0 ? rows[0] : null);
        })
        .catch(reject);
    } else {
      // SQLite
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized. Please wait for database to be ready.'));
      return;
    }
    
    if (typeof db.execute === 'function') {
      // Turso client
      db.execute(sql, params)
        .then(result => {
          resolve({
            lastID: result.lastInsertRowid || null,
            changes: result.rowsAffected || 0
          });
        })
        .catch(reject);
    } else {
      // SQLite
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({
          lastID: this.lastID,
          changes: this.changes,
          id: this.lastID
        });
      });
    }
  });
};

module.exports = {
  init,
  query,
  get,
  run
};

