@echo off
REM Comprehensive QA Test Runner for Windows
echo ================================================================================
echo   FINANCIAL PLANNER - COMPREHENSIVE QA TEST SUITE
echo ================================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Check if we're in the tests directory
if not exist "run_full_qa.py" (
    echo ERROR: Please run this script from the tests directory
    echo Current directory: %CD%
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo WARNING: .env file not found in tests directory
    echo.
    echo Please create tests/.env with:
    echo   TEST_BASE_URL=http://localhost:3000
    echo   TEST_EMAIL=your-test-email@example.com
    echo   TEST_PASSWORD=YourTestPassword123!
    echo.
    pause
)

REM Check if dependencies are installed
python -c "import pytest, selenium" >nul 2>&1
if errorlevel 1 (
    echo Installing test dependencies...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

echo.
echo Starting comprehensive QA tests...
echo This will test ALL features of the application.
echo.
echo Make sure your application is running on http://localhost:3000
echo.
pause

REM Run the QA tests
python run_full_qa.py

echo.
echo ================================================================================
echo   QA TEST RUN COMPLETE
echo ================================================================================
echo.
echo Check the HTML report for detailed results.
echo.
pause
