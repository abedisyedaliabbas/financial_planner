// Database verification script
// Run with: node server/verify-db.js

const db = require('./database');
const path = require('path');
const fs = require('fs');

async function verifyDatabase() {
  try {
    console.log('🔍 Verifying database...\n');
    
    // Check if database file exists
    const dbPath = path.join(__dirname, 'financial_tracker.db');
    console.log('📁 Database path:', dbPath);
    console.log('📁 Absolute path:', path.resolve(dbPath));
    
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      console.log(`✅ Database file exists (${(stats.size / 1024).toFixed(2)} KB)`);
    } else {
      console.log('❌ Database file does NOT exist!');
      return;
    }
    
    // Initialize database
    await db.init();
    console.log('✅ Database initialized\n');
    
    // Check tables
    const tables = await db.query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log(`📊 Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    console.log('');
    
    // Check users
    const users = await db.query('SELECT id, email, name, country, created_at FROM users ORDER BY id');
    console.log(`👥 Found ${users.length} users:`);
    if (users.length === 0) {
      console.log('   ⚠️  No users found in database!');
    } else {
      users.forEach(user => {
        console.log(`   - ID: ${user.id}, Email: ${user.email}, Name: ${user.name || 'N/A'}, Country: ${user.country || 'N/A'}, Created: ${user.created_at}`);
      });
    }
    console.log('');
    
    // Check other data
    const bankAccounts = await db.query('SELECT COUNT(*) as count FROM bank_accounts');
    const creditCards = await db.query('SELECT COUNT(*) as count FROM credit_cards');
    const expenses = await db.query('SELECT COUNT(*) as count FROM expenses');
    const income = await db.query('SELECT COUNT(*) as count FROM income');
    
    console.log('📈 Data summary:');
    console.log(`   - Bank Accounts: ${bankAccounts[0].count}`);
    console.log(`   - Credit Cards: ${creditCards[0].count}`);
    console.log(`   - Expenses: ${expenses[0].count}`);
    console.log(`   - Income: ${income[0].count}`);
    console.log('');
    
    console.log('✅ Database verification complete!');
    
    // Close database
    if (db.db) {
      db.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('✓ Database connection closed');
        }
      });
    }
  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  }
}

verifyDatabase();


