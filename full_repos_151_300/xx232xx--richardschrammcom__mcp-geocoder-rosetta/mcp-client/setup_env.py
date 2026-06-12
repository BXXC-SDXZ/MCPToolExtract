#!/usr/bin/env python
"""
Helper script to set up the environment for the MCP client.
This script installs the required dependencies for the MCP servers.
"""

import subprocess
import sys
import os
import argparse

def main():
    parser = argparse.ArgumentParser(description='Set up environment for MCP client')
    parser.add_argument('--server', choices=['urllib', 'googlemaps', 'typescript'], 
                        help='Server implementation to use')
    args = parser.parse_args()
    
    if not args.server:
        print("Please specify a server implementation with --server")
        sys.exit(1)
    
    # Create virtual environment if it doesn't exist
    if not os.path.exists('.venv'):
        print("Creating virtual environment...")
        subprocess.run(["uv", "venv", ".venv"], check=True)
    
    # Activate virtual environment - this script should be run with "source"
    if args.server == 'urllib':
        print("Installing dependencies for urllib implementation...")
        subprocess.run(["uv", "pip", "install", "mcp[cli]"], check=True)
        
    elif args.server == 'googlemaps':
        print("Installing dependencies for Google Maps implementation...")
        subprocess.run(["uv", "pip", "install", "mcp[cli]", "googlemaps"], check=True)
        
    elif args.server == 'typescript':
        print("Setting up TypeScript implementation...")
        os.chdir("../typescript-googlemaps")
        subprocess.run(["npm", "install"], check=True)
        os.chdir("../mcp-client")
    
    print("\nEnvironment setup complete!")
    print("\nTo run the client with the selected server, use:")
    if args.server == 'urllib':
        print("python client.py ../python-urllib/geocoder.py")
    elif args.server == 'googlemaps':
        print("python client.py ../python-googlemaps/geocoder.py")
    elif args.server == 'typescript':
        print("cd ../typescript-googlemaps && npm start")
        print("# In another terminal:")
        print("python client.py ../typescript-googlemaps/geocoder.ts")

if __name__ == "__main__":
    main()