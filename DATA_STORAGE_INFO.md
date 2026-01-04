# 📊 Data Storage Information

## Database Location

**All user data is stored in a SQLite database file:**

```
financial-planner-public/server/financial_tracker.db
```

## What Data is Stored

The database contains the following tables:

### User Data
- **users** - User accounts, passwords (hashed), subscription info
- **bank_accounts** - Bank account information
- **credit_cards** - Credit card details
- **debit_cards** - Debit card information
- **expenses** - Expense transactions
- **income** - Income entries
- **savings** - Savings accounts
- **financial_goals** - Financial goals
- **bill_reminders** - Bill reminders
- **installments** - Credit card installments
- **loans** - Loan information
- **stocks** - Stock investments (Premium only)
- **recurring_transactions** - Recurring transactions (Premium only)
- **budget** - Budget planning (Premium only)

## Data Security

1. **Passwords**: All passwords are hashed using bcrypt (never stored in plain text)
2. **Data Isolation**: Each user's data is isolated by `user_id` - users cannot see each other's data
3. **Local Storage**: Data is stored locally on the server (not in the cloud by default)

## Database Access

- **File Location**: `financial-planner-public/server/financial_tracker.db`
- **Format**: SQLite3 database
- **Backup**: You can backup by copying the `.db` file
- **View Data**: Use SQLite browser tools like DB Browser for SQLite

## Troubleshooting

If you're having issues with sign-up/sign-in:

1. **Check if database file exists**: Look for `financial_tracker.db` in the server folder
2. **Check file permissions**: The server needs read/write access to the database file
3. **Check server logs**: Look for database connection errors
4. **Delete and recreate**: If corrupted, delete the `.db` file and restart the server (it will recreate automatically)

## Testing Database

Run this command to test the database:
```bash
cd financial-planner-public/server
node test-db.js
```

This will:
- Test database connection
- Show existing users
- Verify read/write permissions


