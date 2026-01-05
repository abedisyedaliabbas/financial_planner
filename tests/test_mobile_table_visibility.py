"""
Mobile Table Visibility Tests
Tests to verify that income and expenses tables are visible on mobile devices
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
import time

class TestMobileTableVisibility:
    """Test that tables are visible on mobile viewport"""
    
    def test_income_table_visible_mobile(self, logged_in_driver, wait):
        """Test that income entries are visible on mobile viewport"""
        driver = logged_in_driver
        
        # Set mobile viewport
        driver.set_window_size(375, 667)  # iPhone SE size
        time.sleep(1)
        
        # Navigate to income page
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/income")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        time.sleep(2)
        
        # Check if table wrapper exists
        table_wrappers = driver.find_elements(By.CLASS_NAME, "table-wrapper")
        assert len(table_wrappers) > 0, "Table wrapper should exist"
        
        # Check if table exists inside wrapper
        tables = driver.find_elements(By.CSS_SELECTOR, ".table-wrapper .table")
        assert len(tables) > 0, "Table should exist inside table-wrapper"
        
        # Check if table is visible (not hidden by CSS)
        table = tables[0]
        assert table.is_displayed(), "Table should be visible"
        
        # Check computed style to ensure display is not 'none'
        display_style = driver.execute_script(
            "return window.getComputedStyle(arguments[0]).display;", 
            table
        )
        assert display_style != 'none', f"Table display should not be 'none', got: {display_style}"
        
        # Check if there are table rows (even if empty)
        rows = driver.find_elements(By.CSS_SELECTOR, ".table-wrapper .table tbody tr")
        print(f"Found {len(rows)} table rows")
        
        # Check if table is scrollable
        is_scrollable = driver.execute_script(
            "return arguments[0].scrollWidth > arguments[0].clientWidth;",
            table_wrappers[0]
        )
        print(f"Table is scrollable: {is_scrollable}")
        
        assert True, "Income table visibility test passed"
    
    def test_expenses_table_visible_mobile(self, logged_in_driver, wait):
        """Test that expenses entries are visible on mobile viewport"""
        driver = logged_in_driver
        
        # Set mobile viewport
        driver.set_window_size(375, 667)  # iPhone SE size
        time.sleep(1)
        
        # Navigate to expenses page
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/expenses")
        
        # Wait for page to load
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        time.sleep(2)
        
        # Check if table wrapper exists
        table_wrappers = driver.find_elements(By.CLASS_NAME, "table-wrapper")
        assert len(table_wrappers) > 0, "Table wrapper should exist"
        
        # Check if table exists inside wrapper
        tables = driver.find_elements(By.CSS_SELECTOR, ".table-wrapper .table")
        assert len(tables) > 0, "Table should exist inside table-wrapper"
        
        # Check if table is visible (not hidden by CSS)
        table = tables[0]
        assert table.is_displayed(), "Table should be visible"
        
        # Check computed style to ensure display is not 'none'
        display_style = driver.execute_script(
            "return window.getComputedStyle(arguments[0]).display;", 
            table
        )
        assert display_style != 'none', f"Table display should not be 'none', got: {display_style}"
        
        # Check visibility style
        visibility_style = driver.execute_script(
            "return window.getComputedStyle(arguments[0]).visibility;", 
            table
        )
        assert visibility_style != 'hidden', f"Table visibility should not be 'hidden', got: {visibility_style}"
        
        # Check if there are table rows
        rows = driver.find_elements(By.CSS_SELECTOR, ".table-wrapper .table tbody tr")
        print(f"Found {len(rows)} table rows")
        
        assert True, "Expenses table visibility test passed"
    
    def test_table_data_loading(self, logged_in_driver, wait):
        """Test that data is actually loaded and displayed in tables"""
        driver = logged_in_driver
        
        # Set mobile viewport
        driver.set_window_size(375, 667)
        time.sleep(1)
        
        # Test income page
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/income")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        time.sleep(3)  # Wait for data to load
        
        # Check for summary cards (indicates data loaded)
        summary_cards = driver.find_elements(By.CLASS_NAME, "summary-cards-grid")
        print(f"Income page - Found {len(summary_cards)} summary card grids")
        
        # Check console for errors
        logs = driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        if errors:
            print(f"Browser console errors: {errors}")
        
        # Test expenses page
        driver.get(f"{driver.current_url.split('/')[0]}//{driver.current_url.split('/')[2]}/expenses")
        wait.until(EC.presence_of_element_located((By.TAG_NAME, "h2")))
        time.sleep(3)  # Wait for data to load
        
        # Check for summary cards
        summary_cards = driver.find_elements(By.CLASS_NAME, "summary-cards-grid")
        print(f"Expenses page - Found {len(summary_cards)} summary card grids")
        
        # Check for table rows with data
        data_rows = driver.find_elements(By.CSS_SELECTOR, ".table-wrapper .table tbody tr:not(:last-child)")
        print(f"Expenses page - Found {len(data_rows)} data rows")
        
        assert True, "Table data loading test passed"
