# 🔧 WebDriver Setup Guide

## Current Issue

The tests are failing because WebDriver cannot be initialized. This is because:

1. **ChromeDriverManager** cannot detect your Chrome version (network issue or Chrome not in PATH)
2. **EdgeDriverManager** cannot download EdgeDriver (network connection issue)
3. **Manual ChromeDriver** path may not be correct

## Quick Fix Options

### Option 1: Download ChromeDriver Manually (Recommended)

1. **Check your Chrome version:**
   - Open Chrome
   - Go to: `chrome://version/`
   - Note the version number (e.g., `131.0.6778.85`)

2. **Download matching ChromeDriver:**
   - Go to: https://googlechromelabs.github.io/chrome-for-testing/
   - Or: https://chromedriver.chromium.org/downloads
   - Download the version matching your Chrome

3. **Extract to C:\chromedriver\:**
   ```powershell
   # Create directory if it doesn't exist
   New-Item -ItemType Directory -Force -Path "C:\chromedriver"
   
   # Extract chromedriver.exe to C:\chromedriver\chromedriver.exe
   ```

4. **Update tests/.env:**
   ```env
   CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe
   TEST_BROWSER=chrome
   ```

### Option 2: Use System ChromeDriver (if in PATH)

If ChromeDriver is already in your system PATH, you can use it directly:

1. **Check if ChromeDriver is in PATH:**
   ```powershell
   chromedriver --version
   ```

2. **If it works, update conftest.py to use system ChromeDriver**

### Option 3: Fix Network Connection

The EdgeDriverManager error suggests a network issue. Try:

1. **Check internet connection**
2. **Check firewall/proxy settings**
3. **Try downloading manually** (see Option 1)

### Option 4: Use Pre-downloaded Drivers

If you have drivers already downloaded:

1. **ChromeDriver:**
   - Place at: `C:\chromedriver\chromedriver.exe`
   - Set in `.env`: `CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe`

2. **EdgeDriver:**
   - Download from: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
   - Place at: `C:\edgedriver\msedgedriver.exe`
   - Set in `.env`: `EDGE_DRIVER_PATH=C:\edgedriver\msedgedriver.exe`

## Verify Setup

After setting up, verify:

```powershell
# Check ChromeDriver
Test-Path "C:\chromedriver\chromedriver.exe"

# Check if it's executable
& "C:\chromedriver\chromedriver.exe" --version
```

## Test Configuration

Make sure your `tests/.env` has:

```env
TEST_BASE_URL=http://localhost:3000
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=YourTestPassword123!
TEST_BROWSER=chrome
CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe
```

## Next Steps

1. ✅ Download ChromeDriver matching your Chrome version
2. ✅ Extract to `C:\chromedriver\chromedriver.exe`
3. ✅ Update `tests/.env` with the path
4. ✅ Ensure your application is running on `http://localhost:3000`
5. ✅ Run tests again: `python run_full_qa.py`

## Troubleshooting

**"ChromeDriver not found":**
- Check the path in `.env`
- Verify the file exists: `Test-Path "C:\chromedriver\chromedriver.exe"`

**"Version mismatch":**
- Download ChromeDriver matching your Chrome version exactly
- Check Chrome version: `chrome://version/`

**"Network error":**
- Check internet connection
- Try downloading drivers manually
- Check firewall settings

**"Application not running":**
- Start backend: `cd server && npm start`
- Start frontend: `cd client && npm start`
- Verify: Open `http://localhost:3000` in browser

---

Once ChromeDriver is properly set up, the tests will run successfully! 🚀
