# Comprehensive Testing Checklist for Financial Planner Public Version

## Pre-Deployment Testing Guide

### 1. Authentication & User Management ✅
- [ ] **Registration**
  - [ ] Register new user with email and password
  - [ ] Register with country selection
  - [ ] Register with default currency selection
  - [ ] Verify default subscription tier is "free"
  - [ ] Test duplicate email registration (should fail)
  - [ ] Test weak password validation
  - [ ] Test password confirmation matching

- [ ] **Login**
  - [ ] Login with correct credentials
  - [ ] Login with incorrect password (should fail)
  - [ ] Login with non-existent email (should fail)
  - [ ] Verify JWT token is stored
  - [ ] Verify user session persists on page refresh

- [ ] **Logout**
  - [ ] Logout clears token and redirects to login
  - [ ] Protected routes redirect after logout

### 2. Subscription Limits (Free Tier) ✅
- [ ] **Bank Accounts Limit (2 accounts)**
  - [ ] Create 1st bank account (should succeed)
  - [ ] Create 2nd bank account (should succeed)
  - [ ] Try to create 3rd bank account (should show limit error)
  - [ ] Verify upgrade prompt appears when limit reached
  - [ ] Delete one account, then create new one (should work)

- [ ] **Credit Cards Limit (5 cards)**
  - [ ] Create 1st credit card (should succeed)
  - [ ] Create 2nd, 3rd, 4th, 5th credit cards (all should succeed)
  - [ ] Try to create 6th credit card (should show limit error)
  - [ ] Verify upgrade prompt appears

- [ ] **Monthly Expenses Limit (50)**
  - [ ] Add expenses up to 50 (should all succeed)
  - [ ] Try to add 51st expense (should show limit error)

- [ ] **Monthly Income Limit (5 entries)**
  - [ ] Add income entries up to 5 (should all succeed)
  - [ ] Try to add 6th income entry (should show limit error)

- [ ] **Goals Limit (1 goal)**
  - [ ] Create 1 goal (should succeed)
  - [ ] Try to create 2nd goal (should show limit error)

- [ ] **Bills Limit (3 reminders)**
  - [ ] Create 3 bill reminders (should all succeed)
  - [ ] Try to create 4th reminder (should show limit error)

### 3. Bank Accounts Feature ✅
- [ ] **Create Bank Account**
  - [ ] Create with all required fields (name, bank, country)
  - [ ] Create with optional fields (account number, interest rate)
  - [ ] Verify currency auto-fills from country selection
  - [ ] Verify custom currency can be entered
  - [ ] Test with different countries (Canada, Singapore, Pakistan, etc.)
  - [ ] Test bank name autocomplete for each country
  - [ ] Test custom bank name entry
  - [ ] Verify account appears in list after creation
  - [ ] Verify balance displays correctly

- [ ] **Read Bank Accounts**
  - [ ] View all bank accounts
  - [ ] Verify currency conversion works
  - [ ] Verify total balance calculation
  - [ ] Test "Show Original Currency" option
  - [ ] Test currency selector dropdown

- [ ] **Update Bank Account**
  - [ ] Edit account name
  - [ ] Edit balance
  - [ ] Edit currency
  - [ ] Edit interest rate
  - [ ] Verify changes save correctly

- [ ] **Delete Bank Account**
  - [ ] Delete account (should remove from list)
  - [ ] Verify associated debit cards are handled (if any)

- [ ] **Debit Cards (NEW FEATURE)**
  - [ ] Add debit card to bank account
  - [ ] Add multiple debit cards (up to 5 per account)
  - [ ] Try to add 6th debit card (should show error)
  - [ ] Edit debit card details
  - [ ] Delete debit card
  - [ ] Verify debit card appears in bank account card
  - [ ] Verify debit card count shows correctly (X/5)

### 4. Credit Cards Feature ✅
- [ ] **Create Credit Card**
  - [ ] Create with all required fields (name, country)
  - [ ] Create with credit limit and current balance
  - [ ] Test currency selection
  - [ ] Test linking to bank account (optional)
  - [ ] Verify card appears in list
  - [ ] Verify utilization calculation
  - [ ] Verify available credit calculation

- [ ] **Read Credit Cards**
  - [ ] View all credit cards
  - [ ] Verify currency conversion
  - [ ] Verify total credit limit calculation
  - [ ] Verify total outstanding calculation
  - [ ] Verify overall utilization percentage

- [ ] **Update Credit Card**
  - [ ] Edit credit limit
  - [ ] Edit current balance
  - [ ] Edit due date
  - [ ] Edit interest rate
  - [ ] Verify changes reflect in calculations

- [ ] **Delete Credit Card**
  - [ ] Delete credit card
  - [ ] Verify it's removed from list

### 5. Credit & Debt Combined Page (NEW FEATURE) ✅
- [ ] **Overview Tab**
  - [ ] Verify summary cards display correctly
  - [ ] Verify total credit limit
  - [ ] Verify total outstanding
  - [ ] Verify available credit
  - [ ] Verify credit utilization percentage
  - [ ] Verify debt breakdown (credit cards, installments, loans)
  - [ ] Verify quick summary table

- [ ] **Credit Cards Tab**
  - [ ] Verify credit cards list displays
  - [ ] Verify upcoming payments alert (if any)
  - [ ] Verify high utilization warning (if any)
  - [ ] Test currency conversion
  - [ ] Test add/edit/delete operations

- [ ] **Installments Tab**
  - [ ] Create installment plan
  - [ ] Link to credit card (optional)
  - [ ] Verify progress tracking
  - [ ] Verify upcoming payments alert
  - [ ] Test currency conversion
  - [ ] Test edit/delete operations

- [ ] **Loans Tab**
  - [ ] Create loan (personal, auto, student, etc.)
  - [ ] Link to bank account (optional)
  - [ ] Verify progress tracking
  - [ ] Verify total debt calculation
  - [ ] Verify upcoming payments alert
  - [ ] Test currency conversion
  - [ ] Test edit/delete operations

- [ ] **Tab Navigation**
  - [ ] Switch between tabs smoothly
  - [ ] Verify tab counts display correctly
  - [ ] Verify active tab highlighting

### 6. Expenses Feature ✅
- [ ] **Create Expense**
  - [ ] Create expense with cash payment
  - [ ] Create expense with credit card payment
  - [ ] Create expense with debit card payment (NEW)
  - [ ] Verify credit card balance updates when paid with credit card
  - [ ] Verify bank account balance decreases when paid with debit card (NEW)
  - [ ] Test different categories
  - [ ] Test currency selection
  - [ ] Test date selection
  - [ ] Verify expense appears in list

- [ ] **Read Expenses**
  - [ ] View all expenses
  - [ ] Verify currency conversion
  - [ ] Verify total expenses calculation
  - [ ] Verify payment method displays correctly
  - [ ] Verify linked card/account displays

- [ ] **Update Expense**
  - [ ] Edit expense amount
  - [ ] Change payment method (cash to credit, etc.)
  - [ ] Change linked card
  - [ ] Verify balance updates correctly when payment method changes

- [ ] **Delete Expense**
  - [ ] Delete expense
  - [ ] Verify credit card balance reverts (if paid with credit card)
  - [ ] Verify bank account balance reverts (if paid with debit card) (NEW)

### 7. Income Feature ✅
- [ ] **Create Income**
  - [ ] Create salary income
  - [ ] Create other income types
  - [ ] Link to bank account (optional)
  - [ ] Test different frequencies (monthly, weekly, etc.)
  - [ ] Test currency selection
  - [ ] Verify income appears in list

- [ ] **Read Income**
  - [ ] View all income entries
  - [ ] Verify currency conversion
  - [ ] Verify total income calculation

- [ ] **Update Income**
  - [ ] Edit income amount
  - [ ] Edit frequency
  - [ ] Edit source

- [ ] **Delete Income**
  - [ ] Delete income entry

### 8. Savings Feature ✅
- [ ] **Create Savings Account**
  - [ ] Create savings account
  - [ ] Link to bank account (optional)
  - [ ] Set goal amount and target date
  - [ ] Verify savings appears in list

- [ ] **Read Savings**
  - [ ] View all savings accounts
  - [ ] Verify progress toward goal
  - [ ] Verify currency conversion

- [ ] **Add Transactions**
  - [ ] Add deposit transaction
  - [ ] Add withdrawal transaction
  - [ ] Verify balance updates

- [ ] **Update/Delete Savings**
  - [ ] Edit savings account
  - [ ] Delete savings account

### 9. Financial Goals Feature ✅
- [ ] **Create Goal**
  - [ ] Create different goal types
  - [ ] Set target amount and date
  - [ ] Set priority level
  - [ ] Verify goal appears in list

- [ ] **Read Goals**
  - [ ] View all goals
  - [ ] Verify progress tracking
  - [ ] Verify currency conversion

- [ ] **Update/Delete Goals**
  - [ ] Edit goal details
  - [ ] Mark goal as completed
  - [ ] Delete goal

### 10. Bill Reminders Feature ✅
- [ ] **Create Bill Reminder**
  - [ ] Create bill with due date
  - [ ] Link to credit card or bank account
  - [ ] Set frequency
  - [ ] Verify reminder appears in list

- [ ] **Read Bills**
  - [ ] View all bill reminders
  - [ ] Verify upcoming bills highlight
  - [ ] Verify overdue bills highlight

- [ ] **Update/Delete Bills**
  - [ ] Mark bill as paid
  - [ ] Edit bill details
  - [ ] Delete bill

### 11. Currency Conversion (NEW FEATURE) ✅
- [ ] **Currency Selector**
  - [ ] Test currency selector on all pages
  - [ ] Verify conversion rates are accurate
  - [ ] Test "Show Original Currency" option
  - [ ] Verify converted amounts display correctly
  - [ ] Verify original currency shows in parentheses when converted

- [ ] **Pages with Currency Conversion**
  - [ ] Bank Accounts page
  - [ ] Credit Cards page
  - [ ] Credit & Debt page (all tabs)
  - [ ] Expenses page
  - [ ] Income page
  - [ ] Savings page
  - [ ] Dashboard

### 12. Text Size & Design Control (NEW FEATURE) ✅
- [ ] **Text Size Control**
  - [ ] Open text size control panel
  - [ ] Change text size (small, medium, large, x-large)
  - [ ] Verify changes apply across all pages
  - [ ] Verify settings persist after page refresh

- [ ] **Font Family Control**
  - [ ] Change font family (default, serif, monospace, rounded)
  - [ ] Verify changes apply across all pages
  - [ ] Verify settings persist

- [ ] **Line Height Control**
  - [ ] Change line height (tight, normal, relaxed, loose)
  - [ ] Verify changes apply
  - [ ] Verify settings persist

- [ ] **Color Customization**
  - [ ] Change alert color (blue, green, purple, teal, indigo)
  - [ ] Change warning color (orange, amber, yellow, red, pink)
  - [ ] Verify colors apply to upcoming payments alerts
  - [ ] Verify colors apply to info/reminder cards
  - [ ] Verify settings persist

- [ ] **Reset to Defaults**
  - [ ] Click reset button
  - [ ] Verify all settings return to defaults

### 13. Dashboard ✅
- [ ] **Overview Display**
  - [ ] Verify all metrics display correctly
  - [ ] Verify net worth calculation
  - [ ] Verify savings rate calculation
  - [ ] Verify debt ratio calculation
  - [ ] Verify credit utilization
  - [ ] Verify minimum payment calculation

- [ ] **Charts & Visualizations**
  - [ ] Verify expense by category chart
  - [ ] Verify income vs expenses chart
  - [ ] Verify savings progress chart
  - [ ] Test chart export (if available)

- [ ] **Data Summary**
  - [ ] Verify account counts
  - [ ] Verify card counts
  - [ ] Verify expense counts
  - [ ] Verify income counts

- [ ] **Empty State**
  - [ ] Verify friendly empty state when no data
  - [ ] Verify quick-start buttons work

### 14. Navigation & UI ✅
- [ ] **Sidebar Navigation**
  - [ ] Verify all links work
  - [ ] Verify active page highlighting
  - [ ] Test mobile hamburger menu
  - [ ] Test theme toggle (if available)

- [ ] **Responsive Design**
  - [ ] Test on desktop (1920x1080, 1366x768)
  - [ ] Test on tablet (768x1024)
  - [ ] Test on mobile (375x667, 414x896)
  - [ ] Verify tables are scrollable on mobile
  - [ ] Verify modals are mobile-friendly
  - [ ] Verify buttons are touch-friendly

- [ ] **Forms & Modals**
  - [ ] Verify all modals open/close correctly
  - [ ] Verify form validation works
  - [ ] Verify required field indicators (*)
  - [ ] Verify error messages display
  - [ ] Verify success messages display

### 15. Error Handling ✅
- [ ] **API Errors**
  - [ ] Test 401 (unauthorized) - should redirect to login
  - [ ] Test 403 (forbidden/limit reached) - should show upgrade prompt
  - [ ] Test 429 (rate limit) - should show wait message
  - [ ] Test 500 (server error) - should show error message
  - [ ] Test network errors - should show error message

- [ ] **Form Validation**
  - [ ] Test required field validation
  - [ ] Test number field validation
  - [ ] Test date field validation
  - [ ] Test email validation (registration)

### 16. Data Integrity ✅
- [ ] **Balance Updates**
  - [ ] Verify credit card balance updates when expense added
  - [ ] Verify bank account balance decreases when expense paid with debit card
  - [ ] Verify balances revert when expenses deleted
  - [ ] Verify balances update correctly when expenses edited

- [ ] **Foreign Key Constraints**
  - [ ] Delete bank account with linked debit cards (should handle gracefully)
  - [ ] Delete credit card with linked expenses (should handle gracefully)
  - [ ] Delete credit card with linked installments (should handle gracefully)

### 17. Premium Features (Should be Blocked for Free Users) ✅
- [ ] **Stocks Feature**
  - [ ] Verify free users cannot access stocks
  - [ ] Verify upgrade prompt appears

- [ ] **Budget Feature**
  - [ ] Verify free users cannot access budget
  - [ ] Verify upgrade prompt appears

- [ ] **Unlimited Features**
  - [ ] Verify premium users can create unlimited accounts
  - [ ] Verify premium users can create unlimited credit cards
  - [ ] Verify premium users have no monthly limits

### 18. Export Features ✅
- [ ] **Data Export**
  - [ ] Test Excel export (if available)
  - [ ] Test CSV export (if available)
  - [ ] Test PDF export (if available)
  - [ ] Test chart image download (if available)

### 19. Performance Testing ✅
- [ ] **Load Time**
  - [ ] Verify pages load within 2-3 seconds
  - [ ] Verify API calls complete quickly
  - [ ] Verify no memory leaks on long sessions

- [ ] **Large Data Sets**
  - [ ] Test with 50+ expenses
  - [ ] Test with 10+ bank accounts (premium)
  - [ ] Test with 20+ credit cards (premium)
  - [ ] Verify pagination or lazy loading works

### 20. Browser Compatibility ✅
- [ ] **Desktop Browsers**
  - [ ] Chrome (latest)
  - [ ] Firefox (latest)
  - [ ] Edge (latest)
  - [ ] Safari (latest, if on Mac)

- [ ] **Mobile Browsers**
  - [ ] Chrome Mobile
  - [ ] Safari Mobile (iOS)
  - [ ] Samsung Internet

### 21. Security Testing ✅
- [ ] **Authentication**
  - [ ] Verify passwords are hashed (check database)
  - [ ] Verify JWT tokens expire correctly
  - [ ] Verify protected routes require authentication

- [ ] **Data Isolation**
  - [ ] Create account as User A
  - [ ] Login as User B
  - [ ] Verify User B cannot see User A's data
  - [ ] Verify User B cannot modify User A's data

### 22. Edge Cases ✅
- [ ] **Empty States**
  - [ ] Test all pages with no data
  - [ ] Verify friendly empty states
  - [ ] Verify "Add" buttons are visible

- [ ] **Special Characters**
  - [ ] Test account names with special characters
  - [ ] Test descriptions with emojis
  - [ ] Test currency symbols

- [ ] **Large Numbers**
  - [ ] Test with very large balances (millions)
  - [ ] Test with very small amounts (0.01)
  - [ ] Test with negative numbers (should be prevented or handled)

- [ ] **Date Edge Cases**
  - [ ] Test with past dates
  - [ ] Test with future dates
  - [ ] Test with invalid dates

## Testing Priority

### Critical (Must Test Before Deployment)
1. Authentication (login, register, logout)
2. Subscription limits (2 bank accounts, 5 credit cards)
3. Bank account CRUD operations
4. Credit card CRUD operations
5. Expense creation with debit/credit cards
6. Balance updates when expenses added/deleted
7. Currency conversion
8. Data isolation between users

### High Priority
1. Debit cards feature
2. Credit & Debt combined page
3. Installments and Loans
4. Text size and color customization
5. Dashboard calculations
6. Error handling

### Medium Priority
1. Income, Savings, Goals, Bills
2. Export features
3. Mobile responsiveness
4. Form validations

### Low Priority
1. Premium feature blocking
2. Browser compatibility
3. Performance with large datasets

## Notes
- Test with both free and premium accounts
- Test with multiple currencies
- Test on different devices
- Keep console open to catch any JavaScript errors
- Check network tab for failed API calls
