"""
Comprehensive authentication tests
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import time

class TestAuthentication:
    """Test user registration and login"""
    
    def test_register_new_user(self, driver, wait, test_user):
        """Test user registration flow"""
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/register")
        
        # Wait for registration form
        wait.until(EC.presence_of_element_located((By.ID, "email")))
        
        # Fill registration form
        driver.find_element(By.ID, "name").send_keys(test_user['name'])
        driver.find_element(By.ID, "email").send_keys(test_user['email'])
        driver.find_element(By.ID, "password").send_keys(test_user['password'])
        driver.find_element(By.ID, "confirmPassword").send_keys(test_user['password'])
        
        # Select country
        country_select = driver.find_element(By.ID, "country")
        country_select.click()
        driver.find_element(By.XPATH, f"//option[text()='{test_user['country']}']").click()
        
        # Select currency
        currency_select = driver.find_element(By.ID, "default_currency")
        currency_select.click()
        driver.find_element(By.XPATH, f"//option[contains(text(), '{test_user['currency']}')]").click()
        
        # Submit
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        submit_btn.click()
        
        # Wait for redirect to dashboard or check for success
        try:
            wait.until(EC.url_contains("/dashboard"))
            assert "/dashboard" in driver.current_url, "Should redirect to dashboard after registration"
        except TimeoutException:
            # Check for error message
            error_elements = driver.find_elements(By.CLASS_NAME, "error")
            if error_elements:
                pytest.fail(f"Registration failed: {error_elements[0].text}")
            else:
                pytest.fail("Registration did not redirect to dashboard")
    
    def test_login_with_valid_credentials(self, driver, wait):
        """Test login with valid credentials"""
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/login")
        
        # Wait for login form
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        password_input = driver.find_element(By.ID, "password")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # Login
        email_input.clear()
        email_input.send_keys("test@example.com")  # Use test credentials
        password_input.clear()
        password_input.send_keys("Test1234!@#$")
        submit_btn.click()
        
        # Wait for dashboard
        wait.until(EC.url_contains("/dashboard"))
        assert "/dashboard" in driver.current_url, "Should redirect to dashboard after login"
    
    def test_login_with_invalid_credentials(self, driver, wait):
        """Test login with invalid credentials"""
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/login")
        
        # Wait for login form
        email_input = wait.until(EC.presence_of_element_located((By.ID, "email")))
        password_input = driver.find_element(By.ID, "password")
        submit_btn = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        
        # Try invalid login
        email_input.clear()
        email_input.send_keys("invalid@example.com")
        password_input.clear()
        password_input.send_keys("wrongpassword")
        submit_btn.click()
        
        # Should show error message
        time.sleep(2)  # Wait for error to appear
        error_elements = driver.find_elements(By.CLASS_NAME, "error")
        assert len(error_elements) > 0, "Should show error message for invalid credentials"
    
    def test_logout(self, logged_in_driver, wait):
        """Test logout functionality"""
        driver = logged_in_driver
        
        # Find and click logout button
        logout_btn = wait.until(EC.element_to_be_clickable((By.CLASS_NAME, "logout-btn")))
        logout_btn.click()
        
        # Should redirect to login
        wait.until(EC.url_contains("/login"))
        assert "/login" in driver.current_url, "Should redirect to login after logout"


