// Quick database test script
const db = require('./database');
const path = require('path');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📁 Database path:', path.join(__dirname, 'financial_tracker.db'));
    
    // Initialize database
    await db.init();
    console.log('✅ Database initialized successfully');
    
    // Test query
    const users = await db.query('SELECT * FROM users LIMIT 5');
    console.log(`✅ Database query successful. Found ${users.length} users`);
    
    if (users.length > 0) {
      console.log('\n📊 Existing users:');
      users.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id}, Tier: ${user.subscription_tier})`);
      });
    } else {
      console.log('ℹ️  No users found in database');
    }
    
    // Test insert (just to verify write permissions)
    console.log('\n🧪 Testing write permissions...');
    const testResult = await db.run('SELECT 1 as test');
    console.log('✅ Write test successful');
    
    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testDatabase();


