# Financial Planner - Automated Test Suite

Comprehensive Selenium-based test suite for rigorous testing before deployment.

## 🎯 Test Coverage

### Authentication Tests
- ✅ User registration
- ✅ Login with valid credentials
- ✅ Login with invalid credentials
- ✅ Logout functionality

### Dashboard Tests
- ✅ Dashboard loading
- ✅ Currency selector
- ✅ Export functionality
- ✅ Navigation links

### Bank Accounts Tests
- ✅ Add bank account
- ✅ View bank accounts
- ✅ Edit bank account
- ✅ Delete bank account

### Credit & Debt Tests
- ✅ Page loading
- ✅ Tab navigation
- ✅ Add credit card
- ✅ Currency conversion

### Expenses & Income Tests
- ✅ Add expense
- ✅ Add income

### UI Customization Tests
- ✅ Appearance panel
- ✅ Theme selection
- ✅ Text size changes
- ✅ Quick theme toggle

### Navigation Tests
- ✅ Sidebar navigation
- ✅ Mobile menu

### Subscription Limits Tests
- ✅ Bank account limit (2 for free)
- ✅ Credit card limit (2 for free)
- ✅ Upgrade page

## 🚀 Setup

1. **Install Python dependencies:**
```bash
cd tests
pip install -r requirements.txt
```

2. **Configure test environment:**
Create a `.env` file in the `tests` directory:
```env
TEST_BASE_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=Test1234!@#$
```

3. **Start your application:**
```bash
# In the financial-planner-public directory
npm run dev
```

## 🧪 Running Tests

### Run all tests:
```bash
python run_tests.py
```

### Run specific test file:
```bash
pytest test_authentication.py -v
```

### Run with specific browser (if needed):
```bash
pytest --browser=chrome -v
```

### Run tests in headless mode (default):
Tests run headless by default. To see browser:
Edit `conftest.py` and remove `--headless` option.

## 📊 Test Reports

After running tests, you'll get:
- **HTML Report**: `test_report_YYYYMMDD_HHMMSS.html` - Open in browser for detailed results
- **JUnit XML**: `junit.xml` - For CI/CD integration

## 🔧 Configuration

### Test Settings (conftest.py)
- `BASE_URL`: Application URL (default: http://localhost:3000)
- `TEST_EMAIL`: Test user email
- `TEST_PASSWORD`: Test user password
- Timeout: 20 seconds per action
- Implicit wait: 10 seconds

### Browser Options
- Chrome (default)
- Headless mode enabled
- Window size: 1920x1080
- Disabled automation flags

## 📝 Writing New Tests

1. Create a new test file: `test_feature_name.py`
2. Import fixtures from `conftest.py`
3. Use `logged_in_driver` fixture for authenticated tests
4. Use `wait` fixture for explicit waits

Example:
```python
def test_new_feature(logged_in_driver, wait):
    driver = logged_in_driver
    driver.get(f"{BASE_URL}/new-page")
    # Your test code here
```

## 🐛 Troubleshooting

### Tests failing with timeout:
- Check if application is running
- Verify BASE_URL is correct
- Increase timeout in `conftest.py`

### Element not found:
- Check if element selectors are correct
- Verify page has loaded completely
- Use explicit waits instead of implicit

### Browser not starting:
- Ensure Chrome is installed
- Check ChromeDriver version compatibility
- Try updating webdriver-manager

## 📈 CI/CD Integration

The test suite generates JUnit XML reports compatible with:
- Jenkins
- GitLab CI
- GitHub Actions
- CircleCI
- Travis CI

Example GitHub Actions workflow:
```yaml
- name: Run Tests
  run: |
    cd tests
    pip install -r requirements.txt
    python run_tests.py
```

## 🎯 Pre-Deployment Checklist

Before deploying, ensure:
- ✅ All authentication tests pass
- ✅ All CRUD operations work
- ✅ Subscription limits enforced
- ✅ UI customization works
- ✅ Navigation is functional
- ✅ No console errors
- ✅ Mobile responsiveness verified

## 📞 Support

For issues or questions:
1. Check test logs in HTML report
2. Review browser console for errors
3. Verify application is running correctly
4. Check test configuration

---

**Happy Testing! 🚀**


