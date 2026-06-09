#!/usr/bin/env python
"""
Direct client script for testing MCP geocoder functionality.
"""

import os
import sys
import json
import argparse
from pathlib import Path
import subprocess
import time

def main():
    parser = argparse.ArgumentParser(description="Test MCP geocoder directly")
    parser.add_argument('implementation', choices=['urllib', 'googlemaps', 'typescript'],
                        help='The geocoder implementation to use')
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
    
    print(f"Testing MCP server: {server_path}")
    
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
                        os.environ["GOOGLE_MAPS_API_KEY"] = api_key
                        break
    
    if not api_key:
        print("\nERROR: GOOGLE_MAPS_API_KEY not found in environment or .env file")
        print(f"Please create a .env file in {server_path.parent} with your API key")
        sys.exit(1)
    else:
        print(f"Using Google Maps API key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
    
    # Create a temporary directory for test files
    temp_dir = Path("./temp")
    temp_dir.mkdir(exist_ok=True)
    
    # Launch MCP server
    print("\nStarting MCP server...")
    os.chdir(server_path.parent)
    
    if args.implementation == 'typescript':
        # For TypeScript, we'll start the server directly
        print("Testing TypeScript implementation...")
        
        # Check for npm
        try:
            subprocess.run(["npm", "--version"], check=True, capture_output=True)
            print("npm detected, can run TypeScript implementation")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("ERROR: npm not found. You must have Node.js and npm installed to run the TypeScript implementation.")
            return
        
        # Check and install dependencies if needed
        typescript_dir = server_path.parent
        node_modules_path = typescript_dir / "node_modules"
        if not node_modules_path.exists():
            print("TypeScript dependencies not installed. Installing now...")
            try:
                subprocess.run(["npm", "install"], check=True, cwd=typescript_dir)
                print("Dependencies installed successfully")
            except subprocess.CalledProcessError:
                print("ERROR: Failed to install TypeScript dependencies")
                return
        
        # Create a direct client script using stdio
        temp_stdio_client = temp_dir / "ts_stdio_client.py"
        with open(temp_stdio_client, "w") as f:
            f.write("""#!/usr/bin/env python
import sys
import json
import os
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Set up server parameters
    server_params = StdioServerParameters(
        command="npm",
        args=["start"],
        env=os.environ.copy(),
        cwd=sys.argv[1]  # TypeScript directory
    )
    
    # Connect to the server
    print("Connecting to TypeScript server via stdio...")
    async with AsyncExitStack() as stack:
        try:
            # Connect to the server
            stdio_transport = await stack.enter_async_context(stdio_client(server_params))
            stdio, write = stdio_transport
            session = await stack.enter_async_context(ClientSession(stdio, write))
            
            # Initialize the session
            print("Initializing session...")
            await session.initialize()
            
            # List available tools
            print("\\nListing available tools...")
            response = await session.list_tools()
            tools = response.tools
            print(f"Available tools: {[tool.name for tool in tools]}")
            
            # Test the geocode tool
            print("\\nCalling geocode tool...")
            geocode_result = await session.call_tool(
                "geocode", 
                {"address": "1600 Amphitheatre Parkway, Mountain View, CA"}
            )
            print(f"Geocode result: {geocode_result.content}")
            
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
""")
        
        # Make the script executable
        os.chmod(temp_stdio_client, 0o755)
        
        # Try to connect to the TypeScript server
        print("\nLaunching TypeScript server and testing communication...")
        try:
            client_cmd = [sys.executable, str(temp_stdio_client), str(typescript_dir)]
            print(f"Running command: {' '.join(client_cmd)}")
            result = subprocess.run(client_cmd, check=True)
            print("\nSuccessfully tested TypeScript server!")
        except subprocess.CalledProcessError as e:
            print(f"\nError testing TypeScript server: {e}")
            return
        
        return
    
    # Launch server process
    cmd = ["mcp", "run", server_path.name]
    print(f"Running command: {' '.join(cmd)}")
    
    # Launch server in background
    server_process = subprocess.Popen(
        cmd, 
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Let server start
    print("Waiting for server to start...")
    time.sleep(2)
    
    # Create a simple sample client that connects directly to the server
    print("\nTesting direct communication with server...")
    
    # Create a temporary Python file to communicate with the server
    temp_dir = Path("./temp")
    temp_dir.mkdir(exist_ok=True)
    temp_script = temp_dir / "direct_client.py"
    
    with open(temp_script, "w") as f:
        f.write("""#!/usr/bin/env python
import sys
import json
import os
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Get current environment to pass to server
    env = os.environ.copy()
    
    # Check if GOOGLE_MAPS_API_KEY is in the environment
    if "GOOGLE_MAPS_API_KEY" in env:
        print(f"Using Google Maps API key from environment: {env['GOOGLE_MAPS_API_KEY'][:4]}...{env['GOOGLE_MAPS_API_KEY'][-4:] if len(env['GOOGLE_MAPS_API_KEY']) > 8 else ''}")
    else:
        print("WARNING: GOOGLE_MAPS_API_KEY not found in environment")
    
    # Server parameters
    server_params = StdioServerParameters(
        command="mcp",
        args=["run", sys.argv[1]],
        env=env  # Pass the current environment to the server
    )
    
    # Connect to the server
    print("Connecting to server...")
    async with AsyncExitStack() as stack:
        # Connect to the server
        stdio_transport = await stack.enter_async_context(stdio_client(server_params))
        stdio, write = stdio_transport
        session = await stack.enter_async_context(ClientSession(stdio, write))
        
        # Initialize the session
        print("Initializing session...")
        await session.initialize()
        
        # List available tools
        print("\\nListing available tools...")
        response = await session.list_tools()
        tools = response.tools
        print(f"Available tools: {[tool.name for tool in tools]}")
        
        # Test the debug_info tool if available
        if "debug_info" in [tool.name for tool in tools]:
            print("\\nCalling debug_info tool...")
            debug_result = await session.call_tool("debug_info", {})
            print(f"Debug info result: {debug_result.content}")
        
        # Test the geocode tool
        print("\\nCalling geocode tool...")
        geocode_result = await session.call_tool(
            "geocode", 
            {"address": "1600 Amphitheatre Parkway, Mountain View, CA"}
        )
        print(f"Geocode result: {geocode_result.content}")

if __name__ == "__main__":
    asyncio.run(main())
""")
    
    # Make the script executable
    os.chmod(temp_script, 0o755)
    
    # Run the client script
    print("\nRunning direct client test...")
    try:
        client_cmd = [sys.executable, str(temp_script), server_path.name]
        subprocess.run(client_cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Client error: {e}")
    
    # Cleanup
    print("\nCleaning up...")
    server_process.terminate()
    time.sleep(1)
    if server_process.poll() is None:
        print("Server process didn't terminate, forcing kill...")
        server_process.kill()
    
    print("\nTest complete!")
    
if __name__ == "__main__":
    main()