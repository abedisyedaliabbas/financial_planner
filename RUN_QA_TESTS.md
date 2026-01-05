# 🚀 Quick Start: Run QA Tests

## Step 1: Start Your Application

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Wait for both to be running on:
- Backend: http://localhost:5000 (or your configured port)
- Frontend: http://localhost:3000

## Step 2: Configure Test Environment

Create `tests/.env` file:
```env
TEST_BASE_URL=http://localhost:3000
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=YourTestPassword123!
```

**Important:** The test user must already exist and be verified!

## Step 3: Install Test Dependencies

```bash
cd tests
pip install -r requirements.txt
```

## Step 4: Run Full QA Test Suite

```bash
cd tests
python run_full_qa.py
```

This will:
- ✅ Test ALL features automatically
- ✅ Generate comprehensive HTML report
- ✅ Show detailed pass/fail status
- ✅ Create summary file

## 📊 View Results

After tests complete:
1. Open `tests/QA_REPORT_YYYYMMDD_HHMMSS.html` in your browser
2. Review detailed test results
3. Check `tests/QA_SUMMARY_YYYYMMDD_HHMMSS.txt` for quick summary

## ✅ What Gets Tested

- Authentication (Login, Register, Logout)
- Dashboard (Loading, Currency, Export)
- Bank Accounts (Add, View, Edit, Delete)
- Credit & Debit Cards
- Expenses & Income
- Savings, Goals, Bills, Loans, Stocks, Budget
- Navigation & Mobile Menu
- UI Customization (Themes, Text Size)
- Subscription Limits
- Mobile Responsiveness

## 🎯 Success = Ready for Production!

If all tests pass, your application is ready! 🎉
