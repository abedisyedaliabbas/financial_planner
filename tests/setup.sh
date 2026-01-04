#!/bin/bash
# Setup script for test environment

echo "🚀 Setting up Financial Planner Test Suite..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

echo "✅ Python found: $(python3 --version)"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
TEST_BASE_URL=http://localhost:3000
TEST_EMAIL=test@example.com
TEST_PASSWORD=Test1234!@#$
EOF
    echo "✅ .env file created. Please update with your test credentials."
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run tests:"
echo "  source venv/bin/activate"
echo "  python run_tests.py"
echo ""


