"""
Pytest configuration and fixtures for Selenium tests
Supports Chrome, Edge, and Safari browsers
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.safari.service import Service as SafariService
from selenium.webdriver.safari.options import Options as SafariOptions
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from faker import Faker
import os
from dotenv import load_dotenv

load_dotenv()

fake = Faker()

# Test configuration
BASE_URL = os.getenv('TEST_BASE_URL', 'http://localhost:3000')
TEST_EMAIL = os.getenv('TEST_EMAIL', 'test@example.com')
TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'Test1234!@#$')
ADMIN_EMAIL = os.getenv('ADMIN_EMAIL', 'admin@test.com')
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'Admin1234!@#$')

# Browser configuration
BROWSER = os.getenv('TEST_BROWSER', 'chrome').lower()  # chrome, edge, safari
CHROME_DRIVER_PATH = os.getenv('CHROME_DRIVER_PATH', r'C:\chromedriver\chromedriver.exe')
EDGE_DRIVER_PATH = os.getenv('EDGE_DRIVER_PATH', None)  # Auto-detect if not set

def create_chrome_driver():
    """Create Chrome WebDriver"""
    chrome_options = ChromeOptions()
    
    # Add options for better testing
    chrome_options.add_argument('--headless')  # Run in headless mode (no browser window)
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--disable-blink-features=AutomationControlled')
    chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    chrome_options.add_experimental_option('useAutomationExtension', False)
    
    # User agent to avoid detection
    chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
    
    # Try to use manual path first, then fallback to ChromeDriverManager
    if os.path.exists(CHROME_DRIVER_PATH):
        print(f"Using ChromeDriver from: {CHROME_DRIVER_PATH}")
        service = ChromeService(CHROME_DRIVER_PATH)
    else:
        print(f"ChromeDriver not found at {CHROME_DRIVER_PATH}, trying ChromeDriverManager...")
        try:
            service = ChromeService(ChromeDriverManager().install())
        except Exception as e:
            print(f"Warning: ChromeDriverManager failed: {e}")
            print("Attempting to use latest version...")
            try:
                service = ChromeService(ChromeDriverManager(version="latest").install())
            except Exception as e2:
                print(f"Error: Could not install ChromeDriver: {e2}")
                raise
    
    return webdriver.Chrome(service=service, options=chrome_options)

def create_edge_driver():
    """Create Edge WebDriver"""
    edge_options = EdgeOptions()
    
    # Add options for better testing
    edge_options.add_argument('--headless')  # Run in headless mode
    edge_options.add_argument('--no-sandbox')
    edge_options.add_argument('--disable-dev-shm-usage')
    edge_options.add_argument('--disable-gpu')
    edge_options.add_argument('--window-size=1920,1080')
    edge_options.add_argument('--disable-blink-features=AutomationControlled')
    edge_options.add_experimental_option("excludeSwitches", ["enable-automation"])
    edge_options.add_experimental_option('useAutomationExtension', False)
    
    # Try to use manual path first, then fallback to EdgeDriverManager
    if EDGE_DRIVER_PATH and os.path.exists(EDGE_DRIVER_PATH):
        print(f"Using EdgeDriver from: {EDGE_DRIVER_PATH}")
        service = EdgeService(EDGE_DRIVER_PATH)
    else:
        print("Using EdgeDriverManager to auto-install EdgeDriver...")
        try:
            service = EdgeService(EdgeChromiumDriverManager().install())
        except Exception as e:
            print(f"Error: Could not install EdgeDriver: {e}")
            raise
    
    return webdriver.Edge(service=service, options=edge_options)

def create_safari_driver():
    """Create Safari WebDriver (macOS only)"""
    safari_options = SafariOptions()
    
    # Safari doesn't support headless mode
    # Safari options are limited compared to Chrome/Edge
    
    try:
        service = SafariService()
        return webdriver.Safari(service=service, options=safari_options)
    except Exception as e:
        print(f"Error: Could not create Safari driver: {e}")
        print("Note: Safari WebDriver requires Safari 10+ and SafariDriver to be enabled.")
        print("Enable it in Safari: Develop > Allow Remote Automation")
        raise

@pytest.fixture(scope="session")
def driver():
    """Create and configure WebDriver based on BROWSER environment variable"""
    print(f"\n{'='*60}")
    print(f"Initializing {BROWSER.upper()} WebDriver...")
    print(f"{'='*60}\n")
    
    try:
        if BROWSER == 'chrome':
            driver = create_chrome_driver()
        elif BROWSER == 'edge':
            driver = create_edge_driver()
        elif BROWSER == 'safari':
            driver = create_safari_driver()
        else:
            raise ValueError(f"Unsupported browser: {BROWSER}. Use 'chrome', 'edge', or 'safari'")
        
        driver.implicitly_wait(10)
        print(f"✅ {BROWSER.upper()} WebDriver initialized successfully\n")
        
        yield driver
        
        driver.quit()
        print(f"\n✅ {BROWSER.upper()} WebDriver closed\n")
        
    except Exception as e:
        print(f"\n❌ Failed to initialize {BROWSER.upper()} WebDriver: {e}\n")
        print("\nTroubleshooting:")
        if BROWSER == 'chrome':
            print(f"  - Check if ChromeDriver exists at: {CHROME_DRIVER_PATH}")
            print("  - Or ensure Chrome is installed for auto-detection")
        elif BROWSER == 'edge':
            print("  - Ensure Microsoft Edge is installed")
            print(f"  - Or set EDGE_DRIVER_PATH if using manual driver")
        elif BROWSER == 'safari':
            print("  - Safari WebDriver only works on macOS")
            print("  - Enable 'Allow Remote Automation' in Safari > Develop menu")
        raise

@pytest.fixture
def wait(driver):
    """WebDriverWait instance"""
    return WebDriverWait(driver, 20)

@pytest.fixture
def test_user():
    """Generate test user data"""
    return {
        'email': fake.email(),
        'password': 'Test1234!@#$',
        'name': fake.name(),
        'country': 'United States',
        'currency': 'USD'
    }

@pytest.fixture
def logged_in_driver(driver, wait):
    """Fixture that logs in and returns driver"""
    driver.get(f"{BASE_URL}/login")
    
    # Wait for login form
    email_input = wait.until(EC.presence_of_element_located(("id", "email")))
    password_input = driver.find_element("id", "password")
    submit_btn = driver.find_element("css selector", "button[type='submit']")
    
    # Login
    email_input.clear()
    email_input.send_keys(TEST_EMAIL)
    password_input.clear()
    password_input.send_keys(TEST_PASSWORD)
    submit_btn.click()
    
    # Wait for dashboard
    wait.until(EC.url_contains("/dashboard"))
    
    return driver


