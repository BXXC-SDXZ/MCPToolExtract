#!/usr/bin/env python
"""
Main runner script for the MCP Geocoder Rosetta example.
This script lets you run any of the geocoder implementations with the MCP client.
"""

import os
import sys
import subprocess
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Run an MCP Geocoder implementation')
    parser.add_argument('implementation', choices=['urllib', 'googlemaps', 'typescript'],
                        help='The geocoder implementation to use')
    
    # Add mutually exclusive group for server/client modes
    mode_group = parser.add_mutually_exclusive_group()
    mode_group.add_argument('--server-only', action='store_true', 
                           help='Run only the server component (for debugging)')
    mode_group.add_argument('--client-only', action='store_true',
                           help='Run only the client component (assumes server is running elsewhere)')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Get the project root directory
    project_root = Path(__file__).parent.absolute()
    
    # Set up implementation paths
    implementations = {
        'urllib': project_root / 'python-urllib' / 'geocoder.py',
        'googlemaps': project_root / 'python-googlemaps' / 'geocoder.py',
        'typescript': project_root / 'typescript-googlemaps' / 'geocoder.ts'
    }
    
    server_path = implementations[args.implementation]
    
    # Initialize environment variables
    env = os.environ.copy()
    env['PYTHONUNBUFFERED'] = '1'  # Ensure Python output is not buffered
    
    # Check for npm for TypeScript implementation
    if args.implementation == 'typescript':
        # Check if npm exists
        try:
            subprocess.run(["npm", "--version"], check=True, capture_output=True)
            print("npm detected, can run TypeScript implementation")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("ERROR: npm not found. You must have Node.js and npm installed to run the TypeScript implementation.")
            sys.exit(1)
            
        # Check if dependencies are installed
        typescript_dir = server_path.parent
        node_modules_path = typescript_dir / "node_modules"
        if not node_modules_path.exists():
            print("TypeScript dependencies not installed. Installing now...")
            try:
                subprocess.run(["npm", "install"], check=True, cwd=typescript_dir)
                print("Dependencies installed successfully")
            except subprocess.CalledProcessError:
                print("ERROR: Failed to install TypeScript dependencies")
                sys.exit(1)
    
    # Install dependencies if needed
    client_dir = project_root / 'mcp-client'
    
    # Check for required modules based on implementation
    if args.implementation == 'googlemaps':
        print("Checking for googlemaps module...")
        try:
            import googlemaps
            print("googlemaps module found!")
        except ImportError:
            print("Installing googlemaps module...")
            subprocess.run(["pip", "install", "googlemaps"], check=True)
    
    # Check for mcp module
    try:
        import mcp
        print("mcp module found!")
    except ImportError:
        print("Installing mcp module...")
        subprocess.run(["pip", "install", "mcp[cli]"], check=True)
    
    # Run the client
    print(f"\nRunning MCP client with {args.implementation} implementation...")
    print(f"Client directory: {client_dir}")
    print(f"Server path: {server_path}")
    print(f"Python executable: {sys.executable}")
    
    # We've already set environment variables at the beginning
    
    # Make sure we have a Google Maps API key
    api_key = os.environ.get("GOOGLE_MAPS_API_KEY")
    if not api_key:
        # Try to read from .env file
        env_file = server_path.parent / ".env"
        if env_file.exists():
            with open(env_file, 'r') as f:
                for line in f:
                    if line.strip().startswith("GOOGLE_MAPS_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].strip()
                        if api_key.startswith('"') and api_key.endswith('"'):
                            api_key = api_key[1:-1]
                        env["GOOGLE_MAPS_API_KEY"] = api_key
                        break
    
    if not api_key:
        print("\nWARNING: GOOGLE_MAPS_API_KEY not found in environment or .env file")
        print(f"Please create a .env file in {server_path.parent} with your API key")
        print("Continuing anyway, but geocoding will likely fail...\n")
    else:
        print(f"Using Google Maps API key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
    
    # Check if we want to run the server separately
    if args.server_only or args.client_only:
        if args.server_only:
            print("\n===== RUNNING SERVER ONLY =====\n")
            os.chdir(os.path.dirname(server_path))
            cmd = ["mcp", "run", os.path.basename(server_path)]
            print(f"Running command: {' '.join(cmd)}")
            subprocess.run(cmd, env=env, check=True)
        elif args.client_only:
            print("\n===== RUNNING CLIENT ONLY =====\n")
            print("Make sure the server is already running in another terminal!")
            
            if args.implementation == 'typescript':
                # For TypeScript, we need to use a different approach
                print("Connecting to TypeScript server...")
                
                # Use direct MCP client interface
                import asyncio
                from mcp import ClientSession, StdioServerParameters
                from mcp.client.stdio import stdio_client
                from contextlib import AsyncExitStack
                
                async def run_typescript_client():
                    try:
                        print("Starting client and connecting to external TypeScript server...")
                        
                        # Set up server parameters for TypeScript
                        typescript_server_cmd = "npm"
                        typescript_server_args = ["start"]
                        
                        # Use the TypeScript directory path
                        typescript_dir = server_path.parent
                        print(f"TypeScript directory: {typescript_dir}")
                        
                        # Set up server parameters
                        server_params = StdioServerParameters(
                            command=typescript_server_cmd,
                            args=typescript_server_args,
                            env=env,
                            cwd=str(typescript_dir)
                        )
                        
                        # Connect using stdio
                        print(f"Connecting to TypeScript server using stdio...")
                        
                        async with AsyncExitStack() as stack:
                            # Connect using stdio for TypeScript
                            stdio_transport = await stack.enter_async_context(stdio_client(server_params))
                            stdio, write = stdio_transport
                            session = await stack.enter_async_context(ClientSession(stdio, write))
                            
                            # Initialize session
                            await session.initialize()
                            
                            # List available tools
                            response = await session.list_tools()
                            tools = response.tools
                            print("\nConnected to TypeScript server with tools:", [tool.name for tool in tools])
                            
                            # Run the chat loop
                            print("\nMCP Client Started!")
                            print("Type your queries (addresses to geocode) or 'quit' to exit.")
                            
                            while True:
                                try:
                                    query = input("\nAddress to geocode: ").strip()
                                    
                                    if query.lower() == 'quit':
                                        break
                                    
                                    # Process query using geocode tool
                                    print(f"Calling geocode tool with address: {query}")
                                    result = await session.call_tool("geocode", {"address": query})
                                    
                                    # Pretty print the result if it's JSON
                                    try:
                                        content_text = result.content[0].text
                                        if content_text.startswith('{'):
                                            location_data = json.loads(content_text)
                                            print("\nGeocoding Result:")
                                            print(f"  Address: {location_data.get('address', 'Unknown')}")
                                            print(f"  Latitude: {location_data.get('latitude', 'Unknown')}")
                                            print(f"  Longitude: {location_data.get('longitude', 'Unknown')}")
                                            print(f"  Google Maps: https://maps.google.com/?q={location_data.get('latitude', '')},{location_data.get('longitude', '')}")
                                        else:
                                            print(f"\nResult: {content_text}")
                                    except Exception as e:
                                        print(f"\nResult (raw): {result.content}")
                                    
                                except Exception as e:
                                    print(f"\nError: {str(e)}")
                        
                    except Exception as e:
                        print(f"Client error: {str(e)}")
                        import traceback
                        traceback.print_exc()
                
                # Run the TypeScript client
                try:
                    asyncio.run(run_typescript_client())
                except Exception as e:
                    print(f"Error connecting to TypeScript server: {e}")
                    print("\nMake sure the TypeScript server is running with:")
                    print(f"cd {project_root}/typescript-googlemaps && npm start")
            else:
                # Normal client-only mode for Python servers
                os.chdir(client_dir)
                cmd = [sys.executable, "client.py", str(server_path)]
                print(f"Running command: {' '.join(cmd)}")
                env['MCP_SERVER_EXTERNAL'] = 'true'  # Tell client not to start server
                subprocess.run(cmd, env=env, check=True)
    else:
        # Normal mode - run both client and server together
        print("\n===== RUNNING CLIENT AND SERVER TOGETHER =====\n")
        
        # Updated to use the MCP client directly
        import asyncio
        import json
        from mcp import ClientSession, StdioServerParameters
        from mcp.client.stdio import stdio_client
        from contextlib import AsyncExitStack
        
        async def run_client():
            try:
                # Launch the server
                print("Starting server and connecting client...")
                
                # Set the appropriate server command based on implementation
                if args.implementation == 'typescript':
                    server_params = StdioServerParameters(
                        command="npm",
                        args=["start"],
                        env=env,
                        cwd=str(server_path.parent)
                    )
                    print(f"Starting TypeScript server with npm start in {server_path.parent}")
                else:
                    server_params = StdioServerParameters(
                        command="mcp",
                        args=["run", os.path.basename(server_path)],
                        env=env
                    )
                
                # Connect to the server
                async with AsyncExitStack() as stack:
                    stdio_transport = await stack.enter_async_context(stdio_client(server_params))
                    stdio, write = stdio_transport
                    session = await stack.enter_async_context(ClientSession(stdio, write))
                    
                    # Initialize session
                    await session.initialize()
                    
                    # List available tools
                    response = await session.list_tools()
                    tools = response.tools
                    print("\nConnected to server with tools:", [tool.name for tool in tools])
                    
                    # Display debug info if available
                    if "debug_info" in [tool.name for tool in tools]:
                        print("\nServer Information:")
                        debug_result = await session.call_tool("debug_info", {})
                        try:
                            debug_info = json.loads(debug_result.content[0].text)
                            print(f"  Server name: {debug_info.get('server_name', 'Unknown')}")
                            print(f"  Python version: {debug_info.get('python_version', 'Unknown').split()[0]}")
                            print(f"  Working directory: {debug_info.get('working_directory', 'Unknown')}")
                            print(f"  Has API key: {'Yes' if 'GOOGLE_MAPS_API_KEY' in debug_info.get('env_vars', {}) else 'No'}")
                        except Exception as e:
                            print(f"  Error parsing debug info: {e}")
                    
                    # Run the chat loop
                    print("\nMCP Client Started!")
                    print("Type your queries (addresses to geocode) or 'quit' to exit.")
                    
                    while True:
                        try:
                            query = input("\nAddress to geocode: ").strip()
                            
                            if query.lower() == 'quit':
                                break
                            
                            # Process query using geocode tool
                            print(f"Calling geocode tool with address: {query}")
                            result = await session.call_tool("geocode", {"address": query})
                            
                            # Pretty print the result if it's JSON
                            try:
                                content_text = result.content[0].text
                                if content_text.startswith('{'):
                                    location_data = json.loads(content_text)
                                    print("\nGeocoding Result:")
                                    print(f"  Address: {location_data.get('address', 'Unknown')}")
                                    print(f"  Latitude: {location_data.get('latitude', 'Unknown')}")
                                    print(f"  Longitude: {location_data.get('longitude', 'Unknown')}")
                                    print(f"  Google Maps: https://maps.google.com/?q={location_data.get('latitude', '')},{location_data.get('longitude', '')}")
                                else:
                                    print(f"\nResult: {content_text}")
                            except Exception as e:
                                print(f"\nResult (raw): {result.content}")
                            
                        except Exception as e:
                            print(f"\nError: {str(e)}")
            
            except Exception as e:
                print(f"Client error: {str(e)}")
                import traceback
                traceback.print_exc()
        
        # Run in the correct working directory
        os.chdir(os.path.dirname(server_path))
        
        # Start the client
        asyncio.run(run_client())

if __name__ == "__main__":
    main()