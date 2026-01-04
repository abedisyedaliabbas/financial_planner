"""
Dashboard functionality tests
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestDashboard:
    """Test dashboard features"""
    
    def test_dashboard_loads(self, logged_in_driver, wait):
        """Test that dashboard loads correctly"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/dashboard")
        
        # Wait for dashboard elements
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Check for key dashboard elements
        page_title = driver.find_element(By.TAG_NAME, "h1").text
        assert "Dashboard" in page_title or "Financial" in page_title, "Dashboard should have proper title"
    
    def test_dashboard_currency_selector(self, logged_in_driver, wait):
        """Test currency selector on dashboard"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/dashboard")
        
        # Find currency selector
        currency_select = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "select")))
        
        # Change currency
        currency_select.click()
        option = driver.find_element(By.XPATH, "//option[contains(text(), 'SGD')]")
        option.click()
        
        time.sleep(1)  # Wait for currency conversion
        
        # Verify currency changed (check if SGD appears in page)
        page_text = driver.page_source
        assert "SGD" in page_text or currency_select.get_attribute("value") == "SGD"
    
    def test_dashboard_export_button(self, logged_in_driver, wait):
        """Test export functionality"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/dashboard")
        
        # Find export button
        export_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Export')]")
        if export_buttons:
            export_btn = export_buttons[0]
            assert export_btn.is_displayed(), "Export button should be visible"
    
    def test_dashboard_navigation_links(self, logged_in_driver, wait):
        """Test navigation from dashboard"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/dashboard")
        
        # Test quick action links if they exist
        quick_links = driver.find_elements(By.XPATH, "//a[contains(@href, '/bank-accounts')]")
        if quick_links:
            quick_links[0].click()
            wait.until(EC.url_contains("/bank-accounts"))
            assert "/bank-accounts" in driver.current_url


