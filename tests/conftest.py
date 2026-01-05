"""
Pytest configuration and fixtures for Selenium tests
"""
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
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

@pytest.fixture(scope="session")
def driver():
    """Create and configure Chrome WebDriver"""
    chrome_options = Options()
    
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
    
    # Try to install ChromeDriver with error handling
    try:
        # Use latest stable version if Chrome detection fails
        from webdriver_manager.core.os_manager import ChromeType
        service = Service(ChromeDriverManager().install())
    except Exception as e:
        print(f"Warning: ChromeDriverManager failed: {e}")
        print("Attempting to use system ChromeDriver or latest version...")
        try:
            # Try with explicit version
            service = Service(ChromeDriverManager(version="latest").install())
        except Exception as e2:
            print(f"Error: Could not install ChromeDriver: {e2}")
            print("Please ensure Chrome is installed and try again.")
            raise
    
    driver = webdriver.Chrome(service=service, options=chrome_options)
    driver.implicitly_wait(10)
    
    yield driver
    
    driver.quit()

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


