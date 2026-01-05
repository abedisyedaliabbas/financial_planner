#!/usr/bin/env python3
"""
Main test runner script with comprehensive reporting
"""
import subprocess
import sys
import os
from datetime import datetime

def run_tests():
    """Run all tests with comprehensive reporting"""
    print("=" * 80)
    print("🚀 Financial Planner - Comprehensive Test Suite")
    print("=" * 80)
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Test configuration
    test_dir = os.path.dirname(os.path.abspath(__file__))
    html_report = os.path.join(test_dir, f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.html")
    
    # Run pytest with options - FULL TEST RUN (no stopping on failures)
    pytest_args = [
        "pytest",
        "-v",  # Verbose
        "--tb=short",  # Short traceback format
        f"--html={html_report}",  # HTML report
        "--self-contained-html",  # Self-contained HTML
        f"--junitxml={os.path.join(test_dir, 'junit.xml')}",  # JUnit XML for CI/CD
        # Removed -x flag to run ALL tests regardless of failures
        "--timeout=300",  # 5 minute timeout per test
        "--durations=10",  # Show 10 slowest tests
        "-ra",  # Show extra test summary info for all tests
        test_dir
    ]
    
    print("Running tests...")
    print(f"Test directory: {test_dir}")
    print(f"HTML report will be saved to: {html_report}")
    print()
    
    try:
        result = subprocess.run(pytest_args, cwd=test_dir)
        
        print()
        print("=" * 80)
        if result.returncode == 0:
            print("✅ All tests passed!")
        else:
            print(f"❌ Tests completed with {result.returncode} failures")
        print("=" * 80)
        print(f"HTML Report: {html_report}")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        return result.returncode
        
    except KeyboardInterrupt:
        print("\n⚠️  Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Error running tests: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(run_tests())


