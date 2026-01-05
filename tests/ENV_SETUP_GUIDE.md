# 📝 Test Environment (.env) Setup Guide

## Required Environment Variables

Create or update `tests/.env` file with the following:

```env
# Application URL (where your app is running)
TEST_BASE_URL=http://localhost:3000

# Test User Credentials
# IMPORTANT: This user must ALREADY EXIST in your database and be VERIFIED
TEST_EMAIL=your-actual-email@example.com
TEST_PASSWORD=YourActualPassword123!

# Browser Selection (optional, defaults to chrome)
TEST_BROWSER=chrome

# Optional: Manual WebDriver Paths
CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe
EDGE_DRIVER_PATH=C:\edgedriver\msedgedriver.exe
```

## What Email and Password to Use?

### ✅ Use Your REAL Account

**Use an account that:**
- ✅ Already exists in your database
- ✅ Email is verified (email_verified = 1)
- ✅ You can log in with successfully
- ✅ Has some test data (optional, but helpful)

### Example:

If you registered with:
- Email: `abedishah@hotmail.com`
- Password: `YourPassword123!`

Then use:
```env
TEST_EMAIL=abedishah@hotmail.com
TEST_PASSWORD=YourPassword123!
```

### ⚠️ Important Notes:

1. **Email Must Be Verified:**
   - The test user's email must be verified
   - If not verified, tests will fail at login
   - Verify the email first, or use an account that's already verified

2. **Account Must Exist:**
   - Don't use a new email that doesn't exist yet
   - The tests will try to log in, not register
   - Use an account you've already created

3. **Password Must Be Correct:**
   - Use the exact password you used when registering
   - Case-sensitive
   - Include special characters exactly as you set them

## Quick Setup Steps

1. **Check if your account exists:**
   - Try logging in manually at `http://localhost:3000/login`
   - If login works, use those credentials

2. **Verify email (if needed):**
   - Check your email for verification link
   - Or use "Resend Verification" on login page
   - Or manually verify in database (for testing)

3. **Create tests/.env file:**
   ```env
   TEST_BASE_URL=http://localhost:3000
   TEST_EMAIL=abedishah@hotmail.com
   TEST_PASSWORD=YourActualPassword
   TEST_BROWSER=chrome
   ```

4. **Test the credentials:**
   ```bash
   # Try logging in manually first to verify credentials work
   # Then run tests
   python run_full_qa.py
   ```

## Security Note

⚠️ **Never commit `.env` file to Git!**
- The `.env` file should be in `.gitignore`
- Contains sensitive credentials
- Keep it local only

## Troubleshooting

**"Invalid email or password" error:**
- Check email spelling (case-sensitive)
- Check password (case-sensitive, special characters)
- Verify account exists in database
- Try logging in manually first

**"Email not verified" error:**
- Verify the email address first
- Use "Resend Verification" on login page
- Or use an account that's already verified

**"User not found" error:**
- Account doesn't exist
- Create the account first by registering
- Or use a different existing account

## Example .env File

```env
# Application Configuration
TEST_BASE_URL=http://localhost:3000

# Test User (must exist and be verified)
TEST_EMAIL=abedishah@hotmail.com
TEST_PASSWORD=YourPassword123!

# Browser Configuration
TEST_BROWSER=chrome
CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe
```

---

**Remember:** Use credentials for an account that already exists and is verified! ✅
