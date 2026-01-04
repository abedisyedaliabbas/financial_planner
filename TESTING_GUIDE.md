# 🧪 Step-by-Step Testing Guide

Follow this guide to systematically test your financial planner app.

## 🚀 Step 1: Start Your App

```bash
# Make sure you're in the project directory
cd /Users/abedi_dr/Library/CloudStorage/Dropbox/Website_Data/Budget_Abedi/financial-planner-public

# Start both frontend and backend
npm run dev
```

Wait for both servers to start:
- Backend: http://localhost:5001
- Frontend: http://localhost:3000

---

## 📋 Step 2: Test Authentication

### 2.1 Registration
1. Go to http://localhost:3000
2. Click "Sign Up" or go to `/register`
3. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Country: Select any country (e.g., Canada)
   - Default Currency: Should auto-select based on country
   - Password: Test123!@#
   - Confirm Password: Test123!@#
4. Click "Create Free Account"
5. ✅ **Expected**: Redirects to dashboard or login page

### 2.2 Login
1. Go to `/login`
2. Enter email and password
3. Click "Sign In"
4. ✅ **Expected**: Redirects to dashboard

### 2.3 Logout
1. Click "Logout" in the sidebar
2. ✅ **Expected**: Redirects to login page

---

## 💰 Step 3: Test Bank Accounts

### 3.1 Add Bank Account
1. Click "Bank Accounts" in sidebar
2. Click "Add Bank Account"
3. Fill in:
   - Account Name: Test Savings
   - Bank Name: Test Bank
   - Country: Canada
   - Currency: CAD (should auto-select)
   - Current Balance: 4323.00
4. Click "Save"
5. ✅ **Expected**: Account appears in table

### 3.2 Test Currency Conversion
1. In Bank Accounts page, change "Show Original Currency" dropdown
2. Select "USD"
3. ✅ **Expected**: CAD $4,323.00 converts to ~USD $3,202.22

### 3.3 Edit Bank Account
1. Click edit icon on the account
2. Change balance to 5000
3. Click "Save"
4. ✅ **Expected**: Balance updates in table

### 3.4 Delete Bank Account
1. Click delete icon
2. Confirm deletion
3. ✅ **Expected**: Account removed from table

---

## 💳 Step 4: Test Credit Cards

### 4.1 Add Credit Card
1. Click "Credit Cards" in sidebar
2. Make sure you're on "Credit Cards" tab
3. Click "Add Credit Card"
4. Fill in:
   - Card Name: Test Visa
   - Country: United States
   - Currency: USD (auto-selected)
   - Credit Limit: 5000
   - Outstanding Amount: 1000
   - Interest Rate: 18.5
   - Due Date: 15
5. Click "Save"
6. ✅ **Expected**: Card appears in table with available credit of $4,000

### 4.2 Test Installments Tab
1. Click "Installments" tab
2. Click "Add Installment"
3. Fill in:
   - Credit Card: Select the card you just created
   - Description: Test Purchase
   - Total Amount: 2000
   - Remaining Amount: 1500
   - Monthly Payment: 200
   - Currency: USD
4. Click "Add Installment"
5. ✅ **Expected**: Installment appears in table, linked to credit card

### 4.3 Test Loans Tab
1. Click "Loans" tab
2. Click "Add Loan"
3. Fill in:
   - Loan Name: Test Car Loan
   - Loan Type: Auto Loan
   - Lender Name: Test Bank
   - Principal Amount: 20000
   - Remaining Balance: 18000
   - Monthly Payment: 500
   - Interest Rate: 5.5
   - Currency: USD
   - Payment Day: 1
4. Click "Save Loan"
5. ✅ **Expected**: Loan appears in table

---

## 💵 Step 5: Test Income

### 5.1 Add Income
1. Click "Income" in sidebar
2. Click "Add Income"
3. Fill in:
   - Amount: 5000
   - Currency: USD
   - Income Type: Salary
   - Frequency: Monthly
   - Date: Today's date
   - Source: Employer
4. Click "Save"
5. ✅ **Expected**: Income appears in table

---

## 🛒 Step 6: Test Expenses

### 6.1 Add Expense
1. Click "Expenses" in sidebar
2. Click "Add Expense"
3. Fill in:
   - Amount: 100
   - Currency: USD
   - Category: Food
   - Date: Today
   - Payment Method: Credit Card
4. Click "Save"
5. ✅ **Expected**: Expense appears in table

### 6.2 Test Multiple Categories
1. Add expenses in different categories:
   - Shopping: $50
   - Transportation: $30
   - Entertainment: $20
2. ✅ **Expected**: All appear in table, categories are tracked

---

## 📊 Step 7: Test Dashboard

### 7.1 Check Overview
1. Click "Dashboard" in sidebar
2. ✅ **Expected**: 
   - Net Worth shows calculated value
   - Monthly Income shows $5,000
   - Monthly Expenses shows sum of expenses
   - Bank Accounts shows $4,323 (CAD converted to USD)

### 7.2 Test Currency Conversion
1. In Dashboard, change currency dropdown to "CAD"
2. ✅ **Expected**: All amounts convert to CAD

### 7.3 Check Charts
1. Scroll down to see charts
2. ✅ **Expected**:
   - Income vs Expenses chart displays
   - Expense Categories pie chart shows
   - Monthly comparison chart

---

## 🎯 Step 6: Test Financial Goals

### 6.1 Add Goal
1. Click "Goals" in sidebar
2. Click "Add Goal"
3. Fill in:
   - Name: Save for Vacation
   - Goal Type: Savings
   - Target Amount: 5000
   - Current Amount: 1000
   - Target Date: 6 months from now
4. Click "Save"
5. ✅ **Expected**: Goal appears with 20% progress

---

## 📅 Step 7: Test Bill Reminders

### 7.1 Add Bill
1. Click "Bills" in sidebar
2. Click "Add Bill Reminder"
3. Fill in:
   - Name: Internet Bill
   - Amount: 50
   - Due Date: 15 (day of month)
   - Frequency: Monthly
   - Category: Utilities
4. Click "Save"
5. ✅ **Expected**: Bill appears in table

---

## 💳 Step 8: Test Subscription Limits

### 8.1 Test Bank Account Limit (Free Tier)
1. Try to add a second bank account
2. ✅ **Expected**: Should show error "Limit reached, upgrade to Premium"

### 8.2 Test Credit Card Limit
1. Add a second credit card (should work)
2. Try to add a third credit card
3. ✅ **Expected**: Should show error "Limit reached"

### 8.3 Test Expense Limit
1. Add expenses until you reach 50 (free tier limit)
2. Try to add one more
3. ✅ **Expected**: Should show limit error

---

## 🔄 Step 9: Test Data Persistence

### 9.1 Refresh Test
1. Add some data (bank account, expense, etc.)
2. Refresh the page (F5)
3. ✅ **Expected**: All data still there, user still logged in

### 9.2 Logout/Login Test
1. Logout
2. Login again
3. ✅ **Expected**: All your data is still there

---

## 🎨 Step 10: Test UI/UX

### 10.1 Theme Toggle
1. Click theme toggle button (sun/moon icon)
2. ✅ **Expected**: Switches between light and dark mode
3. Refresh page
4. ✅ **Expected**: Theme preference is saved

### 10.2 Navigation
1. Click through all menu items
2. ✅ **Expected**: All pages load correctly
3. Check active page is highlighted

### 10.3 Mobile View
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12)
4. ✅ **Expected**: 
   - Sidebar collapses
   - Tables are scrollable
   - Buttons are tappable

---

## 🐛 Step 11: Check for Errors

### 11.1 Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through the app
4. ✅ **Expected**: No red errors in console

### 11.2 Network Errors
1. Go to Network tab in DevTools
2. Use the app
3. ✅ **Expected**: All API calls return 200 (or appropriate status codes)

---

## ✅ Step 12: Final Verification

### 12.1 Complete Checklist
1. Open `TESTING_CHECKLIST.md`
2. Go through each section
3. Check off items as you test
4. Note any bugs or issues

### 12.2 Test Edge Cases
1. Try entering negative amounts (should work for some fields)
2. Try entering very large numbers
3. Try leaving required fields empty
4. Try invalid date formats
5. ✅ **Expected**: Appropriate validation errors

---

## 📝 Step 13: Document Issues

If you find any bugs:

1. Note the bug in `TESTING_CHECKLIST.md` under "Known Issues"
2. Include:
   - What you were doing
   - What happened
   - What should have happened
   - Steps to reproduce

---

## 🎉 Next Steps

Once all testing is complete:

1. ✅ All features work correctly
2. ✅ No critical bugs found
3. ✅ Currency conversion is accurate
4. ✅ Subscription limits work
5. ✅ UI/UX is polished

**Then proceed to: Setting up production environment!**

See `DEPLOYMENT_QUICKSTART.md` for next steps.

---

## 💡 Tips

- Test with different currencies (USD, CAD, EUR, etc.)
- Test with different countries
- Test on different browsers
- Test on mobile devices
- Test with multiple user accounts
- Test subscription upgrade flow (test mode)
- Keep the checklist open while testing
- Take screenshots of any issues

**Happy Testing! 🧪**

