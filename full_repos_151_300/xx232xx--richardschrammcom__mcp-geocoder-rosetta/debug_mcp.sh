#!/bin/bash
# Enhanced debug script for MCP client/server connection issues

echo "===== MCP DEBUGGING GUIDE ====="
echo
echo "This script will help you debug MCP client/server connection issues."
echo

# Check for Python and MCP installation
echo "STEP 1: Checking environment setup"
echo "---------------------------------"
if command -v python &> /dev/null; then
    PY_VERSION=$(python --version)
    echo "✅ Python found: $PY_VERSION"
else
    echo "❌ Python not found! Please install Python 3.8 or higher."
    exit 1
fi

# Check for MCP installation
if python -c "import mcp" &> /dev/null; then
    echo "✅ MCP module installed"
else
    echo "❌ MCP module not found! Run 'pip install mcp[cli]' to install."
    echo "   Run this command to install: pip install mcp[cli]"
fi

# Check API key
echo 
echo "STEP 2: Checking Google Maps API key"
echo "------------------------------------"
API_KEY=${GOOGLE_MAPS_API_KEY}
if [ -n "$API_KEY" ]; then
    echo "✅ GOOGLE_MAPS_API_KEY found in environment"
    # Mask the key for security in output
    masked=${API_KEY:0:4}...${API_KEY: -4}
    echo "   Key: $masked"
else
    echo "❌ GOOGLE_MAPS_API_KEY not found in environment"
    echo "   You need to set this environment variable."
    echo "   Export in your shell: export GOOGLE_MAPS_API_KEY=your-api-key"
    echo "   Or create .env files in each implementation directory with:"
    echo "   GOOGLE_MAPS_API_KEY=your-api-key"
    
    # Check .env files in implementation directories
    implementations=("python-urllib" "python-googlemaps" "typescript-googlemaps")
    for impl in "${implementations[@]}"; do
        if [ -f "$impl/.env" ]; then
            echo "   Found .env file in $impl directory"
            if grep -q "GOOGLE_MAPS_API_KEY" "$impl/.env"; then
                echo "   ✅ API key found in $impl/.env file"
            else
                echo "   ❌ API key not found in $impl/.env file"
            fi
        else
            echo "   ❌ No .env file found in $impl directory"
        fi
    done
fi

echo
echo "STEP 3: Testing server connection"
echo "--------------------------------"
echo "Would you like to test the urllib implementation server? (y/n)"
read test_server

if [[ "$test_server" == "y" ]]; then
    echo "Running direct test with urllib implementation..."
    
    # Run with timeout to avoid hanging
    python test_direct.py urllib
    
    if [ $? -eq 0 ]; then
        echo "✅ Server test successful!"
    else
        echo "❌ Server test failed."
        echo "   Possible issues:"
        echo "   1. MCP module not installed correctly"
        echo "   2. Google Maps API key not set or invalid"
        echo "   3. Server code has errors"
    fi
else
    echo "Skipping server test."
fi

echo
echo "STEP 4: Troubleshooting commands reference"
echo "-----------------------------------------"
echo "Here are commands you can use to test and debug:"
echo
echo "1. Test the urllib implementation directly:"
echo "   python test_direct.py urllib"
echo
echo "2. Run only the server:"
echo "   python run_geocoder.py urllib --server-only"
echo
echo "3. Run only the client (in a separate terminal):"
echo "   python run_geocoder.py urllib --client-only"
echo
echo "4. Run client and server together:"
echo "   python run_geocoder.py urllib"
echo
echo "5. For TypeScript implementation, first install dependencies:"
echo "   cd typescript-googlemaps && npm install"
echo "   npm start"
echo

echo "Good luck!"