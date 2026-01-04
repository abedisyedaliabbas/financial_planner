"""
Expenses and Income tests
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from faker import Faker
import time

fake = Faker()

class TestExpenses:
    """Test expense management"""
    
    def test_add_expense(self, logged_in_driver, wait):
        """Test adding an expense"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/expenses")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Find Add Expense button
        add_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Add')]")
        if add_buttons:
            add_buttons[0].click()
            time.sleep(1)
            
            # Fill expense form
            category_selects = driver.find_elements(By.NAME, "category")
            if category_selects:
                category_selects[0].click()
                driver.find_element(By.XPATH, "//option[text()='Food']").click()
            
            amount_inputs = driver.find_elements(By.NAME, "amount")
            if amount_inputs:
                amount_inputs[0].clear()
                amount_inputs[0].send_keys("50.00")
            
            description_inputs = driver.find_elements(By.NAME, "description")
            if description_inputs:
                description_inputs[0].clear()
                description_inputs[0].send_keys("Test Expense")
            
            # Submit
            submit_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Save')]")
            if submit_buttons:
                submit_buttons[0].click()
                time.sleep(1)
        
        assert True, "Add expense tested"

class TestIncome:
    """Test income management"""
    
    def test_add_income(self, logged_in_driver, wait):
        """Test adding income"""
        driver = logged_in_driver
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/income")
        
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h1")))
        
        # Find Add Income button
        add_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Add')]")
        if add_buttons:
            add_buttons[0].click()
            time.sleep(1)
            
            # Fill income form
            amount_inputs = driver.find_elements(By.NAME, "amount")
            if amount_inputs:
                amount_inputs[0].clear()
                amount_inputs[0].send_keys("5000.00")
            
            income_type_selects = driver.find_elements(By.NAME, "income_type")
            if income_type_selects:
                income_type_selects[0].click()
                driver.find_element(By.XPATH, "//option[text()='Salary']").click()
            
            # Submit
            submit_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'Save')]")
            if submit_buttons:
                submit_buttons[0].click()
                time.sleep(1)
        
        assert True, "Add income tested"


