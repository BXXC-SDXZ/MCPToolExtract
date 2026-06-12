#!/usr/bin/env python
"""
Wrapper script to run the MCP client with the proper environment.
This script ensures all dependencies are available and properly imported.
"""

import os
import sys
import subprocess
import importlib.util

def check_module(module_name):
    """Check if a module is installed"""
    spec = importlib.util.find_spec(module_name)
    return spec is not None

def main():
    print("Starting MCP client wrapper...")
    
    if len(sys.argv) < 2:
        print("Usage: python run_client.py <server_script_path>")
        sys.exit(1)
    
    server_script = sys.argv[1]
    print(f"Server script: {server_script}")
    
    # Check if we're using a Python server
    is_python = server_script.endswith('.py')
    server_dir = os.path.dirname(os.path.abspath(server_script))
    print(f"Server directory: {server_dir}")
    
    # Make sure the server directory is in the Python path
    if server_dir not in sys.path:
        print(f"Adding {server_dir} to Python path")
        sys.path.insert(0, server_dir)
    
    # Check for required modules
    required_modules = ['mcp']
    if 'googlemaps' in server_script and is_python:
        required_modules.append('googlemaps')
    
    # Install missing modules
    for module in required_modules:
        if not check_module(module):
            print(f"Missing {module} module. Installing...")
            try:
                subprocess.run(["uv", "pip", "install", module], check=True)
                print(f"Successfully installed {module}")
            except subprocess.CalledProcessError as e:
                print(f"Failed to install {module}: {e}")
                sys.exit(1)
        else:
            print(f"Module {module} is already installed")
    
    # Check environment setup
    if not os.path.exists('.env'):
        print("Warning: No .env file found in the current directory")
    else:
        print("Found .env file in the current directory")
    
    # Run the client script
    print("Importing client...")
    try:
        from client import asyncio, main as client_main
        print("Client imported successfully")
        
        print("Running client...")
        asyncio.run(client_main())
    except ImportError as e:
        print(f"Failed to import client: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error running client: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()