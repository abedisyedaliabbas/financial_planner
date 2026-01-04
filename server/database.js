// Database Configuration with Turso (Serverless SQLite) Support
// Automatically uses Turso in production (when env vars are set) or SQLite locally
const path = require('path');
const fs = require('fs');

let db = null;
let isTurso = false;

const init = async () => {
  try {
    // Check if we're using Turso (production) or local SQLite (development)
    // Trim whitespace and newlines from environment variables (common issue in Railway/Vercel)
    const tursoUrl = process.env.TURSO_DATABASE_URL ? process.env.TURSO_DATABASE_URL.trim() : null;
    const tursoToken = process.env.TURSO_AUTH_TOKEN ? process.env.TURSO_AUTH_TOKEN.trim() : null;
    
    if (tursoUrl && tursoToken) {
      // Use Turso (production)
      console.log('📦 Using Turso (Serverless SQLite)');
      console.log('   Database URL:', tursoUrl.replace(/\/\/.*@/, '//***@')); // Hide credentials
      
      const { createClient } = require('@libsql/client');
      db = createClient({
        url: tursoUrl,
        authToken: tursoToken
      });
      isTurso = true;
      
      // Test connection
      try {
        await db.execute('SELECT 1');
        console.log('✅ Connected to Turso database');
      } catch (err) {
        console.error('❌ Failed to connect to Turso:', err.message);
        throw err;
      }
      
      // Create tables for Turso
      await createTables();
      console.log('✅ Database initialization complete');
    } else {
      // Fallback to local SQLite for development
      console.log('📦 Using local SQLite (development mode)');
      console.log('   (Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to use Turso)');
      
      const sqlite3 = require('sqlite3').verbose();
      const dbPath = path.join(__dirname, 'financial_tracker.db');
      
      // Ensure database directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('📁 Created database directory:', dbDir);
      }
      
      console.log('📁 Database path:', dbPath);
      console.log('📁 Absolute database path:', require('path').resolve(dbPath));
      
      return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
          if (err) {
            console.error('❌ Error opening database:', err);
            console.error('Error code:', err.code);
            console.error('Error message:', err.message);
            reject(err);
            return;
          }
          console.log('✅ Connected to local SQLite database:', dbPath);
          
          // Verify database file exists
          if (fs.existsSync(dbPath)) {
            const stats = fs.statSync(dbPath);
            console.log(`✓ Database file exists (${(stats.size / 1024).toFixed(2)} KB)`);
          } else {
            console.warn('⚠️  Warning: Database file does not exist yet (will be created)');
          }
          
          // Enable foreign keys for SQLite
          db.run('PRAGMA foreign_keys = ON', (err) => {
            if (err) {
              console.warn('⚠️  Warning: Could not enable foreign keys:', err);
            } else {
              console.log('✓ Foreign keys enabled');
            }
            
            // Create tables
            createTables().then(() => {
              // Verify tables were created
              setTimeout(() => {
                db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
                  if (err) {
                    console.error('Error checking tables:', err);
                  } else {
                    console.log(`✓ Database initialized with ${tables.length} tables`);
                    if (tables.length > 0) {
                      console.log('  Tables:', tables.map(t => t.name).join(', '));
                    }
                  }
                  resolve();
                });
              }, 100);
            }).catch(reject);
          });
        });
      });
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
};

const createTables = async () => {
  // Users table with subscription support
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

  // Create indexes for email verifications
  try {
    await run(`CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email)`);
  } catch (err) {
    // Indexes might already exist, ignore error
  }

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

  // Create indexes for password resets
  try {
    await run(`CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token)`);
    await run(`CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)`);
  } catch (err) {
    // Indexes might already exist, ignore error
  }

  // Migrate existing databases to add columns (SQLite only, Turso doesn't support ALTER TABLE easily)
  if (!isTurso) {
    try {
      const columns = await query("PRAGMA table_info(users)");
      const columnNames = columns.map(col => col.name);
      
      // Add country column if it doesn't exist
      if (!columnNames.includes('country')) {
        await run(`ALTER TABLE users ADD COLUMN country TEXT`);
        console.log('✓ Added country column to users table');
      }
      
      // Add default_currency column if it doesn't exist
      if (!columnNames.includes('default_currency')) {
        await run(`ALTER TABLE users ADD COLUMN default_currency TEXT DEFAULT 'USD'`);
        console.log('✓ Added default_currency column to users table');
      }
      
      // Add email_verified column if it doesn't exist
      if (!columnNames.includes('email_verified')) {
        await run(`ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0`);
        console.log('✓ Added email_verified column to users table');
      }
      
      // Add email_verified_at column if it doesn't exist
      if (!columnNames.includes('email_verified_at')) {
        await run(`ALTER TABLE users ADD COLUMN email_verified_at DATETIME`);
        console.log('✓ Added email_verified_at column to users table');
      }
      
      // Add mobile_number column if it doesn't exist
      if (!columnNames.includes('mobile_number')) {
        await run(`ALTER TABLE users ADD COLUMN mobile_number TEXT`);
        console.log('✓ Added mobile_number column to users table');
      }
      
      // Migrate expenses table to add debit_card_id if it doesn't exist
      const expenseColumns = await query("PRAGMA table_info(expenses)");
      const expenseColumnNames = expenseColumns.map(col => col.name);
      
      if (!expenseColumnNames.includes('debit_card_id')) {
        await run(`ALTER TABLE expenses ADD COLUMN debit_card_id INTEGER`);
        console.log('✓ Added debit_card_id column to expenses table');
      }
    } catch (err) {
      console.warn('⚠️  Migration warning (may be expected):', err.message);
    }
  }

  // Bank Accounts (with user_id)
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

  // Credit Cards (with user_id)
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

  // Debit Cards (with user_id)
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

  // Expenses (with user_id)
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

  // Income (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS income (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    income_type TEXT,
    frequency TEXT,
    bank_account_id INTEGER,
    source TEXT,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);

  // Savings (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS savings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    account_name TEXT NOT NULL,
    account_type TEXT,
    bank_account_id INTEGER,
    currency TEXT DEFAULT 'USD',
    current_balance REAL DEFAULT 0,
    interest_rate REAL,
    goal_amount REAL,
    target_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);

  // Stocks (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS stocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    company_name TEXT,
    shares REAL NOT NULL,
    purchase_price REAL NOT NULL,
    current_price REAL,
    currency TEXT DEFAULT 'USD',
    purchase_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Installments (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS installments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    credit_card_id INTEGER,
    description TEXT NOT NULL,
    total_amount REAL NOT NULL,
    remaining_amount REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    interest_rate REAL,
    start_date TEXT,
    end_date TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id)
  )`);

  // Loans (with user_id) - Can link to credit cards or bank accounts
  await run(`CREATE TABLE IF NOT EXISTS loans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    loan_name TEXT NOT NULL,
    loan_type TEXT NOT NULL,
    lender_name TEXT,
    credit_card_id INTEGER,
    bank_account_id INTEGER,
    principal_amount REAL NOT NULL,
    remaining_balance REAL NOT NULL,
    monthly_payment REAL NOT NULL,
    interest_rate REAL,
    currency TEXT DEFAULT 'USD',
    start_date TEXT,
    end_date TEXT,
    payment_day INTEGER,
    status TEXT DEFAULT 'active',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);

  // Financial Goals (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS financial_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    goal_type TEXT NOT NULL,
    target_amount REAL NOT NULL,
    current_amount REAL DEFAULT 0,
    target_date TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'active',
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Bill Reminders (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS bill_reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    due_date INTEGER NOT NULL,
    frequency TEXT DEFAULT 'monthly',
    category TEXT,
    is_paid INTEGER DEFAULT 0,
    credit_card_id INTEGER,
    bank_account_id INTEGER,
    notes TEXT,
    last_paid_date TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (credit_card_id) REFERENCES credit_cards(id),
    FOREIGN KEY (bank_account_id) REFERENCES bank_accounts(id)
  )`);

  // Recurring Transactions (with user_id)
  await run(`CREATE TABLE IF NOT EXISTS recurring_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    amount REAL NOT NULL,
    currency TEXT DEFAULT 'USD',
    frequency TEXT NOT NULL,
    description TEXT,
    category TEXT,
    next_date TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  // Budget (with user_id) - Premium feature
  await run(`CREATE TABLE IF NOT EXISTS budget (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category TEXT NOT NULL,
    monthly_limit REAL NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);

  console.log('✅ Database tables created');
};

// Promise wrapper for database operations
const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized. Please wait for database to be ready.'));
      return;
    }
    
    // Turso uses async/await, SQLite uses callbacks
    if (isTurso) {
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
    
    if (isTurso) {
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
    
    if (isTurso) {
      // Turso client
      db.execute(sql, params)
        .then(result => {
          resolve({
            lastID: result.lastInsertRowid || null,
            changes: result.rowsAffected || 0,
            id: result.lastInsertRowid || null
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
  run,
  get db() { return db; }
};
