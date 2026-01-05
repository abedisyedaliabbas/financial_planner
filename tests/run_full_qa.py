#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Comprehensive QA Test Runner - Tests ALL Features
Run this script to perform complete QA testing of the Financial Planner application
"""
import subprocess
import sys
import os
from datetime import datetime

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def print_header(text):
    """Print a formatted header"""
    print("\n" + "=" * 80)
    print(f"  {text}")
    print("=" * 80 + "\n")

def run_full_qa():
    """Run comprehensive QA tests for all features"""
    print_header("🚀 FINANCIAL PLANNER - COMPREHENSIVE QA TEST SUITE")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("\nThis will test ALL features of the application:")
    print("  ✅ Authentication (Login, Register, Logout)")
    print("  ✅ Dashboard (Loading, Currency, Export)")
    print("  ✅ Bank Accounts (Add, View, Edit, Delete)")
    print("  ✅ Credit & Debit Cards (Add, View, Edit, Delete)")
    print("  ✅ Expenses (Add, View, Edit, Delete)")
    print("  ✅ Income (Add, View, Edit, Delete)")
    print("  ✅ Savings Accounts")
    print("  ✅ Financial Goals")
    print("  ✅ Bill Reminders")
    print("  ✅ Loans")
    print("  ✅ Stocks")
    print("  ✅ Budget")
    print("  ✅ Navigation (Sidebar, Mobile Menu)")
    print("  ✅ UI Customization (Themes, Text Size)")
    print("  ✅ Subscription Limits")
    print("  ✅ Mobile Responsiveness")
    print("\n" + "-" * 80)
    
    # Test configuration
    test_dir = os.path.dirname(os.path.abspath(__file__))
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    html_report = os.path.join(test_dir, f"QA_REPORT_{timestamp}.html")
    summary_file = os.path.join(test_dir, f"QA_SUMMARY_{timestamp}.txt")
    
    print(f"\n📁 Test Directory: {test_dir}")
    print(f"📊 HTML Report: {html_report}")
    print(f"📝 Summary File: {summary_file}")
    print("\n" + "-" * 80)
    print("⏳ Starting tests... This may take several minutes.\n")
    
    # Run pytest with comprehensive options (use python -m pytest for Windows compatibility)
    pytest_args = [
        sys.executable,  # Use the same Python interpreter
        "-m", "pytest",
        "-v",  # Verbose output
        "--tb=short",  # Short traceback format
        f"--html={html_report}",  # HTML report
        "--self-contained-html",  # Self-contained HTML
        f"--junitxml={os.path.join(test_dir, 'junit.xml')}",  # JUnit XML for CI/CD
        "--timeout=300",  # 5 minute timeout per test
        "--durations=10",  # Show 10 slowest tests
        "-ra",  # Show extra test summary info for all tests
        "--color=yes",  # Colored output
        test_dir
    ]
    
    try:
        # Run the tests
        result = subprocess.run(
            pytest_args, 
            cwd=test_dir,
            capture_output=False,  # Show output in real-time
            text=True
        )
        
        # Print summary
        print_header("📊 QA TEST RESULTS SUMMARY")
        
        if result.returncode == 0:
            print("✅ ALL TESTS PASSED! 🎉")
            print("\nYour application is ready for production!")
        else:
            print(f"⚠️  SOME TESTS FAILED (Exit code: {result.returncode})")
            print("\nPlease review the HTML report for detailed failure information.")
            print("Fix any issues before deploying to production.")
        
        print(f"\n📊 Detailed HTML Report: {html_report}")
        print(f"📝 Open the HTML report in your browser to see full test results.")
        print(f"\nCompleted at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Create summary file (with UTF-8 encoding for Windows compatibility)
        with open(summary_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("FINANCIAL PLANNER - QA TEST SUMMARY\n")
            f.write("=" * 80 + "\n\n")
            f.write(f"Test Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Exit Code: {result.returncode}\n")
            status_text = "ALL TESTS PASSED" if result.returncode == 0 else "SOME TESTS FAILED"
            f.write(f"Status: {status_text}\n")
            f.write(f"\nHTML Report: {html_report}\n")
            f.write(f"JUnit XML: {os.path.join(test_dir, 'junit.xml')}\n")
        
        print(f"\n📝 Summary saved to: {summary_file}")
        print("\n" + "=" * 80)
        
        return result.returncode
        
    except KeyboardInterrupt:
        print("\n\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\n❌ Error running tests: {e}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    exit_code = run_full_qa()
    sys.exit(exit_code)
