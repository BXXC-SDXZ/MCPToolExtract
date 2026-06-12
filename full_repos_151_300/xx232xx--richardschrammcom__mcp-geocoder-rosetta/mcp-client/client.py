import asyncio
import sys
import os
from typing import Optional
from contextlib import AsyncExitStack

# Add server directory to path to find its modules
def add_server_dir_to_path(server_script_path):
    server_dir = os.path.dirname(os.path.abspath(server_script_path))
    if server_dir not in sys.path:
        sys.path.insert(0, server_dir)

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()  # load environment variables from .env

class MCPClient:
    def __init__(self):
        # Initialize session and client objects
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.anthropic = Anthropic()

    # methods will go here
    async def connect_to_server(self, server_script_path: str):
        """Connect to an MCP server

        Args:
            server_script_path: Path to the server script (.py or .js)
        """
        print(f"\n[DEBUG] Connecting to server: {server_script_path}")
        is_python = server_script_path.endswith('.py')
        is_js = server_script_path.endswith('.js')
        if not (is_python or is_js):
            raise ValueError("Server script must be a .py or .js file")

        # Add server directory to Python path for imports
        if is_python:
            add_server_dir_to_path(server_script_path)
            print(f"[DEBUG] Added server directory to Python path: {os.path.dirname(os.path.abspath(server_script_path))}")
            
        command = "python" if is_python else "node"
        print(f"[DEBUG] Server command: {command} {server_script_path}")
        
        # Check if we should start a separate process or use an existing one
        if os.environ.get("MCP_SERVER_EXTERNAL", "").lower() == "true":
            print("[DEBUG] Using external server - will not start server process")
            # For external servers, we'll connect to a port/socket instead (not implemented yet)
            raise NotImplementedError("External server connections not implemented yet")

        # Create server parameters
        server_params = StdioServerParameters(
            command=command,
            args=[server_script_path],
            env=None
        )
        print("[DEBUG] Prepared server parameters, about to connect...")

        print("[DEBUG] Starting server subprocess and connecting...")
        try:
            stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
            print("[DEBUG] Successfully connected to server subprocess")
            self.stdio, self.write = stdio_transport
        except Exception as e:
            print(f"[DEBUG] Error connecting to server: {e}")
            raise
            
        try:
            print("[DEBUG] Creating MCP client session...")
            self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))
            print("[DEBUG] MCP client session created")
        except Exception as e:
            print(f"[DEBUG] Error creating MCP session: {e}")
            raise

        try:
            print("[DEBUG] Initializing session...")
            await self.session.initialize()
            print("[DEBUG] Session initialized")
        except Exception as e:
            print(f"[DEBUG] Error initializing session: {e}")
            raise

        try:
            # List available tools
            print("[DEBUG] Listing MCP tools...")
            response = await self.session.list_tools()
            tools = response.tools
            print("\nConnected to server with tools:", [tool.name for tool in tools])
        except Exception as e:
            print(f"[DEBUG] Error listing tools: {e}")
            raise

    async def process_query(self, query: str) -> str:
        """Process a query using Claude and available tools"""
        # Initialize the conversation
        messages = [
            {
                "role": "user",
                "content": query
            }
        ]

        # Get available tools from the MCP server
        response = await self.session.list_tools()
        available_tools = [{
            "name": tool.name,
            "description": tool.description,
            "input_schema": tool.inputSchema
        } for tool in response.tools]

        # Display available tools
        print(f"\nAvailable tools: {[tool['name'] for tool in available_tools]}")

        # Initialize final text to accumulate responses
        final_text = []
        conversation_finished = False

        while not conversation_finished:
            try:
                # Call Claude API
                print("\nSending request to Claude...")
                claude_response = self.anthropic.messages.create(
                    model="claude-3-5-sonnet-20241022",
                    max_tokens=1000,
                    messages=messages,
                    tools=available_tools
                )
                
                # Process all content blocks from Claude
                assistant_message_content = []
                has_tool_use = False
                
                for content in claude_response.content:
                    if content.type == 'text':
                        final_text.append(content.text)
                        assistant_message_content.append(content)
                    elif content.type == 'tool_use':
                        has_tool_use = True
                        tool_name = content.name
                        tool_args = content.input
                        tool_id = content.id

                        # Add this tool use to assistant message
                        assistant_message_content.append(content)
                        
                        # Execute tool call through MCP
                        print(f"\nCalling tool {tool_name} with args {tool_args}")
                        try:
                            result = await self.session.call_tool(tool_name, tool_args)
                            tool_result = result.content
                            print(f"Tool result: {tool_result}")
                        except Exception as e:
                            tool_result = f"Error: {str(e)}"
                            print(f"Tool error: {tool_result}")

                        # Add the assistant message (with tool use) to conversation
                        messages.append({
                            "role": "assistant",
                            "content": assistant_message_content
                        })
                        
                        # Add the tool result to conversation
                        messages.append({
                            "role": "user",
                            "content": [
                                {
                                    "type": "tool_result",
                                    "tool_use_id": tool_id,
                                    "content": tool_result
                                }
                            ]
                        })
                        
                        # Reset for next iteration - Claude will continue the conversation
                        assistant_message_content = []
                        break  # Break out of the content loop to get Claude's next response
                
                # If no tool use in this response, we're done
                if not has_tool_use:
                    # Add final assistant message to conversation history
                    messages.append({
                        "role": "assistant",
                        "content": assistant_message_content
                    })
                    conversation_finished = True
                    
            except Exception as e:
                final_text.append(f"Error: {str(e)}")
                conversation_finished = True

        return "\n".join(final_text)

    async def chat_loop(self):
        """Run an interactive chat loop"""
        print("\nMCP Client Started!")
        print("Type your queries or 'quit' to exit.")

        while True:
            try:
                query = input("\nQuery: ").strip()

                if query.lower() == 'quit':
                    break

                response = await self.process_query(query)
                print("\n" + response)

            except Exception as e:
                print(f"\nError: {str(e)}")

    async def cleanup(self):
        """Clean up resources"""
        await self.exit_stack.aclose()

async def main():
    import sys  # Import sys at the beginning of the function
    if len(sys.argv) < 2:
        print("Usage: python client.py <path_to_server_script>")
        sys.exit(1)

    client = MCPClient()
    try:
        await client.connect_to_server(sys.argv[1])
        await client.chat_loop()
    finally:
        await client.cleanup()

if __name__ == "__main__":
    asyncio.run(main())