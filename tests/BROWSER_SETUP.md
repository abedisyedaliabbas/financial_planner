# 🌐 Browser Setup Guide for QA Tests

The test suite supports multiple browsers: **Chrome**, **Edge**, and **Safari**.

## Quick Configuration

### Option 1: Environment Variable (Recommended)

Create or update `tests/.env` file:

```env
# Application URL
TEST_BASE_URL=http://localhost:3000
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=YourTestPassword123!

# Browser Selection (chrome, edge, or safari)
TEST_BROWSER=chrome

# Optional: Manual Driver Paths
CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe
EDGE_DRIVER_PATH=C:\edgedriver\msedgedriver.exe
```

### Option 2: Command Line

```bash
# Windows PowerShell
$env:TEST_BROWSER="chrome"
python run_full_qa.py

# Or for Edge
$env:TEST_BROWSER="edge"
python run_full_qa.py
```

## Browser-Specific Setup

### 🟢 Chrome

**Automatic (Recommended):**
- Just install Chrome browser
- ChromeDriverManager will auto-download the correct driver

**Manual Setup:**
1. Download ChromeDriver from: https://chromedriver.chromium.org/
2. Extract to: `C:\chromedriver\chromedriver.exe`
3. Set in `.env`: `CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe`

**Your Current Setup:**
✅ ChromeDriver is at: `C:\chromedriver\`
✅ Tests will use this path automatically!

### 🔵 Edge (Microsoft Edge)

**Automatic (Recommended):**
- Install Microsoft Edge browser
- EdgeDriverManager will auto-download the correct driver

**Manual Setup:**
1. Download EdgeDriver from: https://developer.microsoft.com/en-us/microsoft-edge/tools/webdriver/
2. Extract to a folder (e.g., `C:\edgedriver\msedgedriver.exe`)
3. Set in `.env`: `EDGE_DRIVER_PATH=C:\edgedriver\msedgedriver.exe`

### 🟠 Safari (macOS Only)

**Requirements:**
- macOS operating system
- Safari 10+ installed
- SafariDriver enabled

**Setup Steps:**
1. Open Safari
2. Go to: Safari > Preferences > Advanced
3. Check "Show Develop menu in menu bar"
4. Go to: Develop > Allow Remote Automation
5. Set in `.env`: `TEST_BROWSER=safari`

**Note:** Safari doesn't support headless mode, so you'll see the browser window during tests.

## Running Tests with Different Browsers

### Chrome (Default)
```bash
cd tests
python run_full_qa.py
```

### Edge
```bash
cd tests
# Set browser in .env or:
$env:TEST_BROWSER="edge"
python run_full_qa.py
```

### Safari (macOS)
```bash
cd tests
# Set browser in .env or:
export TEST_BROWSER=safari
python run_full_qa.py
```

## Troubleshooting

### Chrome Issues

**Error: ChromeDriver not found**
- ✅ Solution: Your ChromeDriver is at `C:\chromedriver\` - this should work!
- If not, check the path in `.env`: `CHROME_DRIVER_PATH=C:\chromedriver\chromedriver.exe`

**Error: Chrome version mismatch**
- Update ChromeDriver to match your Chrome version
- Or let ChromeDriverManager auto-detect (remove `CHROME_DRIVER_PATH` from `.env`)

### Edge Issues

**Error: EdgeDriver not found**
- Install Microsoft Edge browser
- Or set `EDGE_DRIVER_PATH` in `.env` with manual driver path

### Safari Issues

**Error: Safari WebDriver not available**
- Safari WebDriver only works on macOS
- Enable "Allow Remote Automation" in Safari > Develop menu
- Make sure Safari is up to date

### General Issues

**All browsers fail to start:**
- Check if browser is installed
- Check if driver executable has correct permissions
- Try running tests without headless mode (remove `--headless` in `conftest.py`)

## Browser Comparison

| Feature | Chrome | Edge | Safari |
|---------|--------|------|--------|
| Headless Mode | ✅ Yes | ✅ Yes | ❌ No |
| Auto Driver Install | ✅ Yes | ✅ Yes | ⚠️ Manual |
| Windows Support | ✅ Yes | ✅ Yes | ❌ No |
| macOS Support | ✅ Yes | ✅ Yes | ✅ Yes |
| Linux Support | ✅ Yes | ✅ Yes | ❌ No |
| Speed | ⚡ Fast | ⚡ Fast | 🐢 Slower |

## Recommended Setup

**For Windows:**
- Primary: Chrome (with your `C:\chromedriver\` setup)
- Backup: Edge (auto-install)

**For macOS:**
- Primary: Chrome or Safari
- Backup: Edge

**For Linux:**
- Primary: Chrome
- Backup: Edge

## Test Results

All browsers will produce the same test results. The HTML report will indicate which browser was used.

---

**Your Current Configuration:**
- ✅ ChromeDriver: `C:\chromedriver\chromedriver.exe`
- ✅ Edge: Auto-detect (if Edge is installed)
- ✅ Safari: Available on macOS

You're all set! 🚀
