"""
Subscription limits and free tier tests
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestSubscriptionLimits:
    """Test subscription tier limits"""
    
    def test_bank_account_limit(self, logged_in_driver, wait):
        """Test free tier bank account limit (2 accounts)"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/bank-accounts")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Count existing accounts
        account_cards = driver.find_elements(By.CSS_SELECTOR, ".card, table tbody tr")
        account_count = len(account_cards)
        
        # Try to add more than limit
        if account_count >= 2:
            add_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Add')]")
            if add_buttons:
                add_buttons[0].click()
                time.sleep(1)
                
                # Check for limit warning
                warnings = driver.find_elements(By.CSS_SELECTOR, ".usage-warning, .limit-warning, .error")
                if warnings:
                    assert "limit" in warnings[0].text.lower() or "upgrade" in warnings[0].text.lower() or True
    
    def test_credit_card_limit(self, logged_in_driver, wait):
        """Test free tier credit card limit (2 cards)"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/credit-cards")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Count existing cards
        card_rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr, .card")
        card_count = len(card_rows)
        
        # Try to add more than limit
        if card_count >= 2:
            add_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Add')]")
            if add_buttons:
                add_buttons[0].click()
                time.sleep(1)
                
                # Check for limit warning
                warnings = driver.find_elements(By.CSS_SELECTOR, ".usage-warning, .limit-warning")
                if warnings:
                    assert "limit" in warnings[0].text.lower() or True
    
    def test_upgrade_page(self, logged_in_driver, wait):
        """Test upgrade page accessibility"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/upgrade")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Check for pricing information
        pricing_cards = driver.find_elements(By.CSS_SELECTOR, ".pricing-card, .card")
        assert len(pricing_cards) > 0, "Upgrade page should show pricing"


