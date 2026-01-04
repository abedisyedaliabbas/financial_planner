@echo off
REM Setup script for Windows

echo 🚀 Setting up Financial Planner Test Suite...
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is required but not installed.
    exit /b 1
)

echo ✅ Python found
python --version

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📥 Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    (
        echo TEST_BASE_URL=http://localhost:3000
        echo TEST_EMAIL=test@example.com
        echo TEST_PASSWORD=Test1234!@#$
    ) > .env
    echo ✅ .env file created. Please update with your test credentials.
)

echo.
echo ✅ Setup complete!
echo.
echo To run tests:
echo   venv\Scripts\activate
echo   python run_tests.py
echo.

pause


