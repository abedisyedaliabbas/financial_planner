const db = require('./database');
const bcrypt = require('bcryptjs');

// This script seeds the database with sample data for testing
// Run with: node server/seed.js

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Initialize database
    await db.init();

    // Create a test user (or use existing)
    const testEmail = 'test@example.com';
    const testPassword = 'password123';
    
    // Check if user exists
    const existingUsers = await db.query('SELECT * FROM users WHERE email = ?', [testEmail]);
    
    let userId;
    if (existingUsers && existingUsers.length > 0) {
      userId = existingUsers[0].id;
      console.log(`✓ Using existing user: ${testEmail} (ID: ${userId})`);
    } else {
      // Create test user
      const passwordHash = await bcrypt.hash(testPassword, 10);
      const userResult = await db.run(
        'INSERT INTO users (email, password_hash, name, subscription_tier, subscription_status) VALUES (?, ?, ?, ?, ?)',
        [testEmail, passwordHash, 'Test User', 'free', 'active']
      );
      userId = userResult.id;
      console.log(`✓ Created test user: ${testEmail} (ID: ${userId})`);
      console.log(`  Password: ${testPassword}`);
    }

    // Clear existing data for this user (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing data...');
    await db.run('DELETE FROM expenses WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM income WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM installments WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM credit_cards WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM bill_reminders WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM financial_goals WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM savings WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM stocks WHERE user_id = ?', [userId]);
    await db.run('DELETE FROM bank_accounts WHERE user_id = ?', [userId]);

    // Get current date info
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = now.toISOString().split('T')[0];
    const monthStart = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    const monthEnd = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];

    // 1. Bank Account (Free tier allows 1)
    console.log('📦 Adding bank account...');
    const bankAccount = await db.run(
      'INSERT INTO bank_accounts (user_id, account_name, bank_name, account_type, country, currency, current_balance, interest_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Main Checking', 'Chase Bank', 'Checking', 'United States', 'USD', 5420.50, 0.01]
    );
    const bankAccountId = bankAccount.id;
    console.log(`✓ Added bank account: Main Checking (Balance: $5,420.50)`);

    // 2. Credit Cards (Free tier allows 2)
    console.log('💳 Adding credit cards...');
    const card1 = await db.run(
      'INSERT INTO credit_cards (user_id, name, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Chase Sapphire', 'Chase', 'United States', 'USD', 10000, 2340.75, 18.99, 15, 'Credit']
    );
    console.log(`✓ Added credit card: Chase Sapphire (Limit: $10,000, Balance: $2,340.75)`);

    const card2 = await db.run(
      'INSERT INTO credit_cards (user_id, name, bank_name, country, currency, credit_limit, current_balance, interest_rate, due_date, card_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Amex Gold', 'American Express', 'United States', 'USD', 15000, 5670.25, 19.99, 20, 'Credit']
    );
    console.log(`✓ Added credit card: Amex Gold (Limit: $15,000, Balance: $5,670.25)`);

    // 3. Income (Free tier allows 5 per month - adding 3)
    console.log('💰 Adding income entries...');
    const incomeEntries = [
      { amount: 4500, income_type: 'Salary', frequency: 'monthly', description: 'Monthly salary', date: monthStart },
      { amount: 500, income_type: 'Freelance', frequency: 'one-time', description: 'Web design project', date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0] },
      { amount: 200, income_type: 'Investment', frequency: 'monthly', description: 'Dividend payment', date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0] }
    ];

    for (const income of incomeEntries) {
      await db.run(
        'INSERT INTO income (user_id, amount, currency, income_type, frequency, bank_account_id, description, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, income.amount, 'USD', income.income_type, income.frequency, bankAccountId, income.description, income.date]
      );
    }
    console.log(`✓ Added ${incomeEntries.length} income entries (Total: $${incomeEntries.reduce((sum, i) => sum + i.amount, 0).toLocaleString()})`);

    // 4. Expenses (Free tier allows 50 per month - adding 15 sample expenses)
    console.log('💸 Adding expenses...');
    const expenses = [
      { category: 'Food', amount: 45.50, description: 'Grocery shopping', date: new Date(currentYear, currentMonth, 1).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Transportation', amount: 120.00, description: 'Gas', date: new Date(currentYear, currentMonth, 2).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Food', amount: 28.75, description: 'Restaurant', date: new Date(currentYear, currentMonth, 3).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Shopping', amount: 89.99, description: 'Clothing', date: new Date(currentYear, currentMonth, 4).toISOString().split('T')[0], credit_card_id: card2.id },
      { category: 'Utilities', amount: 150.00, description: 'Electricity bill', date: new Date(currentYear, currentMonth, 5).toISOString().split('T')[0] },
      { category: 'Entertainment', amount: 15.99, description: 'Netflix subscription', date: new Date(currentYear, currentMonth, 6).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Food', amount: 65.00, description: 'Grocery shopping', date: new Date(currentYear, currentMonth, 8).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Transportation', amount: 35.00, description: 'Uber ride', date: new Date(currentYear, currentMonth, 9).toISOString().split('T')[0], credit_card_id: card2.id },
      { category: 'Healthcare', amount: 120.00, description: 'Doctor visit', date: new Date(currentYear, currentMonth, 10).toISOString().split('T')[0] },
      { category: 'Food', amount: 42.30, description: 'Restaurant', date: new Date(currentYear, currentMonth, 12).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Shopping', amount: 199.99, description: 'Electronics', date: new Date(currentYear, currentMonth, 14).toISOString().split('T')[0], credit_card_id: card2.id },
      { category: 'Utilities', amount: 85.50, description: 'Internet bill', date: new Date(currentYear, currentMonth, 15).toISOString().split('T')[0] },
      { category: 'Entertainment', amount: 45.00, description: 'Movie tickets', date: new Date(currentYear, currentMonth, 16).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Food', amount: 38.90, description: 'Grocery shopping', date: new Date(currentYear, currentMonth, 18).toISOString().split('T')[0], credit_card_id: card1.id },
      { category: 'Transportation', amount: 95.00, description: 'Car maintenance', date: new Date(currentYear, currentMonth, 20).toISOString().split('T')[0] }
    ];

    for (const expense of expenses) {
      await db.run(
        'INSERT INTO expenses (user_id, category, description, amount, currency, credit_card_id, date) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, expense.category, expense.description, expense.amount, 'USD', expense.credit_card_id || null, expense.date]
      );
    }
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    console.log(`✓ Added ${expenses.length} expenses (Total: $${totalExpenses.toFixed(2)})`);

    // 5. Financial Goal (Free tier allows 1)
    console.log('🎯 Adding financial goal...');
    await db.run(
      'INSERT INTO financial_goals (user_id, name, goal_type, target_amount, current_amount, target_date, priority, status, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Emergency Fund', 'Emergency Fund', 10000, 2500, new Date(currentYear + 1, 0, 1).toISOString().split('T')[0], 'high', 'active', 'Build 6 months of expenses']
    );
    console.log(`✓ Added financial goal: Emergency Fund ($2,500 / $10,000)`);

    // 6. Bill Reminders (Free tier allows 3)
    console.log('📅 Adding bill reminders...');
    const bills = [
      { name: 'Rent', amount: 1200, due_date: 1, frequency: 'monthly', category: 'Rent/Mortgage' },
      { name: 'Electricity', amount: 150, due_date: 15, frequency: 'monthly', category: 'Utilities' },
      { name: 'Internet', amount: 85, due_date: 20, frequency: 'monthly', category: 'Utilities' }
    ];

    for (const bill of bills) {
      await db.run(
        'INSERT INTO bill_reminders (user_id, name, amount, due_date, frequency, category, is_paid, bank_account_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [userId, bill.name, bill.amount, bill.due_date, bill.frequency, bill.category, 0, bankAccountId]
      );
    }
    console.log(`✓ Added ${bills.length} bill reminders`);

    // 7. Installment (loan on credit card)
    console.log('📋 Adding installment...');
    await db.run(
      'INSERT INTO installments (user_id, credit_card_id, description, total_amount, remaining_amount, monthly_payment, currency, interest_rate, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, card1.id, 'Furniture Purchase', 3000, 2100, 300, 'USD', 0, new Date(currentYear, currentMonth - 2, 1).toISOString().split('T')[0], new Date(currentYear, currentMonth + 8, 1).toISOString().split('T')[0], 'active']
    );
    console.log(`✓ Added installment: Furniture Purchase ($2,100 remaining)`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Test User Credentials:');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log('\n💡 You can now log in and see all the sample data!');
    
    // Close database connection
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();

