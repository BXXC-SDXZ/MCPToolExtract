#!/usr/bin/env python
"""
Direct test script for MCP server functionality.
This bypasses the client and tests the server directly using the MCP CLI.
"""

import subprocess
import os
import sys
import json
import argparse
from pathlib import Path

def main():
    parser = argparse.ArgumentParser(description='Test MCP server functionality')
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
        print("\nWARNING: GOOGLE_MAPS_API_KEY not found in environment or .env file")
        print(f"Please create a .env file in {server_path.parent} with your API key")
        print("Continuing anyway, but geocoding will likely fail...\n")
    else:
        print(f"Using Google Maps API key: {api_key[:4]}...{api_key[-4:] if len(api_key) > 8 else ''}")
    
    # Change to the server directory
    os.chdir(server_path.parent)
    
    if args.implementation == 'typescript':
        # For TypeScript, we'll start the server directly
        print("Testing TypeScript implementation...")
        
        # Create a temporary directory for test files
        temp_dir = Path("./temp")
        temp_dir.mkdir(exist_ok=True)
        
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
        
        # Create a client script that can test the npm server
        debug_script_path = temp_dir / "ts_stdio_client.py"
        with open(debug_script_path, "w") as f:
            f.write("""#!/usr/bin/env python
import asyncio
import json
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Launch and connect to server
    env = os.environ.copy()
    server_params = StdioServerParameters(
        command="npm",
        args=["start"],
        env=env,
        cwd=sys.argv[1]  # TypeScript directory
    )
    
    tool_name = sys.argv[2] if len(sys.argv) > 2 else "geocode"
    tool_args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
    
    # Connect to the server
    async with AsyncExitStack() as stack:
        stdio_transport = await stack.enter_async_context(stdio_client(server_params))
        stdio, write = stdio_transport
        session = await stack.enter_async_context(ClientSession(stdio, write))
        
        # Initialize session
        await session.initialize()
        
        # First list available tools to check what's available
        response = await session.list_tools()
        available_tools = [tool.name for tool in response.tools]
        
        # Check if the requested tool is available
        if tool_name not in available_tools:
            print(f"Tool '{tool_name}' not found. Available tools: {available_tools}")
            return
        
        # Call the requested tool
        result = await session.call_tool(tool_name, tool_args)
        if result.content:
            print(result.content[0].text)

if __name__ == "__main__":
    asyncio.run(main())
""")
            
        # Make script executable
        os.chmod(debug_script_path, 0o755)
        
        # Get available tools first
        tools_script_path = temp_dir / "ts_tools.py"
        with open(tools_script_path, "w") as f:
            f.write("""#!/usr/bin/env python
import asyncio
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Launch and connect to server
    env = os.environ.copy()
    server_params = StdioServerParameters(
        command="npm",
        args=["start"],
        env=env,
        cwd=sys.argv[1]  # TypeScript directory
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
        print(",".join([tool.name for tool in response.tools]))

if __name__ == "__main__":
    asyncio.run(main())
""")
            
        # Make script executable
        os.chmod(tools_script_path, 0o755)
        
        # Get tools
        try:
            print("\nGetting available tools from TypeScript server...")
            result = subprocess.run(
                [sys.executable, str(tools_script_path), str(typescript_dir)],
                check=True,
                capture_output=True,
                text=True,
                timeout=20  # TypeScript startup can be slow first time
            )
            available_tools = result.stdout.strip().split(",")
            print(f"TypeScript server provides tools: {available_tools}")
        except subprocess.CalledProcessError as e:
            print(f"Error getting tools: {e}")
            print(f"Stdout: {e.stdout}")
            print(f"Stderr: {e.stderr}")
            return
        
        # Skip the normal server startup but continue with tests
        server_process = None
    
    # Set environment variables
    env = os.environ.copy()
    env["PYTHONUNBUFFERED"] = "1"  # Ensure Python output is not buffered
    
    # Start the server using the MCP CLI
    print("\nStarting server with MCP CLI...")
    server_cmd = ["mcp", "run", server_path.name]
    
    # Add any necessary dependencies
    if args.implementation == 'googlemaps':
        print("Adding googlemaps dependency...")
        server_cmd = ["python", "-m", "mcp", "run", server_path.name]
    
    print(f"Running command: {' '.join(server_cmd)}")
    server_process = subprocess.Popen(
        server_cmd, 
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        env=env
    )
    
    # Give the server a moment to start
    import time
    time.sleep(2)
    
    # For the direct command line testing, we'll need to use a different approach
    # as your MCP installation doesn't support the 'tools' command
    print("\nNOTE: Direct MCP CLI testing not available with current MCP installation")
    print("Using direct Python approach instead...")
    
    # For debug info, let's create a small Python script to call the server directly
    temp_dir = Path("./temp")
    temp_dir.mkdir(exist_ok=True)
    
    debug_script_path = temp_dir / "call_debug.py"
    with open(debug_script_path, "w") as f:
        f.write("""
import asyncio
import json
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Set up server parameters
    env = os.environ.copy()
    server_params = StdioServerParameters(
        command="mcp",
        args=["run", sys.argv[1]],
        env=env
    )
    
    # Connect to the server
    async with AsyncExitStack() as stack:
        stdio_transport = await stack.enter_async_context(stdio_client(server_params))
        stdio, write = stdio_transport
        session = await stack.enter_async_context(ClientSession(stdio, write))
        
        # Initialize session
        await session.initialize()
        
        # Call the requested tool
        tool_name = sys.argv[2] if len(sys.argv) > 2 else "debug_info"
        args = json.loads(sys.argv[3]) if len(sys.argv) > 3 else {}
        
        result = await session.call_tool(tool_name, args)
        print(result.content[0].text)

if __name__ == "__main__":
    asyncio.run(main())
""")
    
    # Make script executable
    os.chmod(debug_script_path, 0o755)
    
    # First, get the list of available tools
    print("\nChecking available tools...")
    list_tools_script_path = temp_dir / "list_tools.py"
    with open(list_tools_script_path, "w") as f:
        f.write("""
import asyncio
import json
import os
import sys
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from contextlib import AsyncExitStack

async def main():
    # Set up server parameters
    env = os.environ.copy()
    server_params = StdioServerParameters(
        command="mcp",
        args=["run", sys.argv[1]],
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
        print(",".join([tool.name for tool in tools]))

if __name__ == "__main__":
    asyncio.run(main())
""")
    
    # Make script executable
    os.chmod(list_tools_script_path, 0o755)
    
    # Get available tools
    tools_cmd = [sys.executable, str(list_tools_script_path), server_path.name]
    available_tools = []
    try:
        result = subprocess.run(
            tools_cmd,
            check=True,
            capture_output=True,
            text=True,
            cwd=server_path.parent,
            env=env,
            timeout=5
        )
        available_tools = result.stdout.strip().split(",")
        print(f"Available tools: {available_tools}")
    except Exception as e:
        print(f"Error getting available tools: {e}")
    
    # Test the debug_info tool if available
    if "debug_info" in available_tools:
        print("\nTesting debug_info tool...")
        debug_cmd = [sys.executable, str(debug_script_path), server_path.name, "debug_info"]
        try:
            print(f"Running command: {' '.join(debug_cmd)}")
            result = subprocess.run(
                debug_cmd,
                check=True,
                capture_output=True,
                text=True,
                cwd=server_path.parent,
                env=env,
                timeout=5  # 5 second timeout
            )
            
            print("\nServer responded successfully!")
            
            # Try to parse the response as JSON
            try:
                debug_info = json.loads(result.stdout)
                print("Server Information:")
                print(f"  Server name: {debug_info.get('server_name', 'Unknown')}")
                print(f"  Python version: {debug_info.get('python_version', 'Unknown').split()[0]}")
                print(f"  Working directory: {debug_info.get('working_directory', 'Unknown')}")
                print(f"  Has API key: {'Yes' if 'GOOGLE_MAPS_API_KEY' in debug_info.get('env_vars', {}) else 'No'}")
            except json.JSONDecodeError:
                print(f"Response (raw): {result.stdout}")
        except subprocess.CalledProcessError as e:
            print(f"Error: {e}")
            print(f"Stdout: {e.stdout}")
            print(f"Stderr: {e.stderr}")
        except subprocess.TimeoutExpired:
            print("Error: Command timed out. Server may not be responding.")
    else:
        print("\nSkipping debug_info test (tool not available in this implementation)")
    
    # Test geocoding
    print("\nTesting geocoding functionality...")
    
    if args.implementation == 'typescript':
        # For TypeScript, use the stdio client script we created
        typescript_dir = server_path.parent
        geocode_cmd = [
            sys.executable, 
            str(debug_script_path),  # This is the ts_stdio_client.py for TypeScript
            str(typescript_dir),
            "geocode",
            '{"address": "1600 Amphitheatre Parkway, Mountain View, CA"}'
        ]
    else:
        # For Python implementations, use the stdio client script
        geocode_cmd = [
            sys.executable, 
            str(debug_script_path), 
            server_path.name, 
            "geocode",
            '{"address": "1600 Amphitheatre Parkway, Mountain View, CA"}'
        ]
    
    try:
        print(f"Running command: {' '.join(geocode_cmd)}")
        result = subprocess.run(
            geocode_cmd,
            check=True,
            capture_output=True,
            text=True,
            cwd=server_path.parent,
            env=env,
            timeout=10  # 10 second timeout for API call
        )
        
        # Try to parse the response as JSON
        try:
            response_text = result.stdout.strip()
            if response_text.startswith("{"):
                geocode_data = json.loads(response_text)
                print("\nGeocoding successful!")
                print("Geocoding Result:")
                print(f"  Address: {geocode_data.get('address', 'Unknown')}")
                print(f"  Latitude: {geocode_data.get('latitude', 'Unknown')}")
                print(f"  Longitude: {geocode_data.get('longitude', 'Unknown')}")
                print(f"  Google Maps: https://maps.google.com/?q={geocode_data.get('latitude', '')},{geocode_data.get('longitude', '')}")
            else:
                print(f"\nGeocoding returned a message: {response_text}")
        except json.JSONDecodeError:
            print(f"\nGeocoding returned non-JSON response: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        print(f"Stdout: {e.stdout}")
        print(f"Stderr: {e.stderr}")
    except subprocess.TimeoutExpired:
        print("Error: Command timed out. Server may not be responding or API key issues.")
    
    # Clean up
    print("\nCleaning up...")
    if server_process:
        server_process.terminate()
        time.sleep(1)
        if server_process.poll() is None:
            print("Server process didn't terminate, forcing kill...")
            server_process.kill()
    elif args.implementation == 'typescript':
        print("Leaving TypeScript server running (it was started externally)")
        print("You can stop it manually in its terminal with Ctrl+C")
    
    print("\nTest complete!")

if __name__ == "__main__":
    main()