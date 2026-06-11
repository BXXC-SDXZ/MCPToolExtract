import asyncio
# import sys

from mcp.types import TextContent, CallToolResult
# from uvicorn import Config  # Import Config for type hinting if needed, though not directly used for running here

from mcp import ClientSession
# Only import the sse_client helper function
from mcp.client.sse import sse_client 

from mcp.server.fastmcp import FastMCP

# Define host and port constants
HOST = "127.0.0.1"
PORT = 8765
SSE_PATH = "/sse"

# Pass host and port to the FastMCP constructor (guessing the arguments)
# Also adding name back, which is often required/good practice
app = FastMCP(name="SSE Echo Server", host=HOST, port=PORT, sse_path=SSE_PATH)

@app.tool()
async def echo(text: str) -> list[TextContent]:
    """Echoes the input text back."""
    print(f"Server received: {text}")
    return [TextContent(type="text", text=f"Echo: {text}")]

async def run_server():
    """Run the FastMCP server with SSE transport."""
    # Note: Host/port/path are now hopefully configured in the app instance
    print(f"Starting SSE server on configured host/port/path ({HOST}:{PORT}{SSE_PATH})...") 
    # Call run_sse_async without arguments, relying on constructor config
    await app.run_sse_async() 

async def run_client():
    """Run the FastMCP client connecting via SSE."""
    server_url = f"http://{HOST}:{PORT}{SSE_PATH}"
    
    await asyncio.sleep(1) 
    print(f"Client connecting to {server_url}") 

    try:
        async with sse_client(url=server_url) as (read, write):
             print("sse_client connected.")
             async with ClientSession(read, write) as session:
                print("ClientSession created.")
                print("Initializing session...")
                await session.initialize() 
                print("Session initialized.")
                
                message_to_send = "Hello from SSE Client!"
                print(f"Client sending: {message_to_send}")
                response: CallToolResult = await session.call_tool("echo", arguments={"text": message_to_send})
                
                if response and response.content and isinstance(response.content[0], TextContent):
                     print(f"Client received: {response.content[0].text}")
                else:
                     print(f"Client received unexpected response: {response}")

    except ImportError:
        # This might still occur if sse_client itself isn't found, 
        # but let's see if the Transport error is gone.
        print("\nImportError: Could not resolve mcp.client.sse.sse_client.")
        print("Please verify the correct import path in your installed mcp package version.")
    except Exception as e:
        print(f"Client error: {e}")
        # Optional: Add more detailed traceback for debugging
        # import traceback
        # traceback.print_exc()

async def main():
    """Run both server and client concurrently."""
    server_task = asyncio.create_task(run_server())
    client_task = asyncio.create_task(run_client())

    # Wait for the client to finish its operation
    await client_task 
    
    # Optionally, you might want to gracefully shut down the server here.
    # For this simple example, we'll just cancel the server task.
    # In a real app, implement proper shutdown signals.
    print("Client finished, stopping server...")
    server_task.cancel()
    try:
        await server_task
    except asyncio.CancelledError:
        print("Server stopped.")

if __name__ == "__main__":
    # Note: Running both client and server in the same script like this is
    # primarily for demonstration. Typically, they would be separate processes.
    asyncio.run(main()) 