# file_agent_client.py
import asyncio
from mcp import ClientSession, StdioServerParameters, types as mcp_types # Alias MCP types
from mcp.client.stdio import stdio_client
from google import genai  # Use the new SDK import
from google.genai import types as genai_types # Alias GenAI types
import os  # Import os for environment variable handling
from dotenv import load_dotenv  # Import load_dotenv to load environment variables from a .env file

# Load environment variables from the .env file
load_dotenv()  # This will read the .env file and set the environment variables

# Initialize the Google GenAI Client using the API key from the .env file
# Ensure you have the GEMINI_API_KEY environment variable set in your .env file.
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Create server parameters
server_params = StdioServerParameters(
    command="python",
    args=["file_agent_server.py"],
)

# Agent logic using the Google GenAI SDK Client
async def agent_callback(
    request: mcp_types.CreateMessageRequestParams,
) -> mcp_types.CreateMessageResult:
    # Extract the conversation history into the format expected by the SDK
    conversation = []
    for msg in request.messages:
        if isinstance(msg.content, mcp_types.TextContent):
            # Map MCP roles to GenAI roles ('user' or 'model')
            role = "user" if msg.role == "user" else "model"
            # Create a Content object for each message
            conversation.append(genai_types.Content(role=role, parts=[genai_types.Part.from_text(msg.content.text)]))
    
    # Define the system instruction for the model
    system_prompt = "You are a helpful file assistant. You can read files, write to files, and list directories."
    
    # Choose the Gemini model
    # Use 'gemini-1.5-pro-latest' or 'gemini-1.5-flash-latest' etc.
    # The SDK documentation often shows model names without the 'models/' prefix for client methods
    model_name = 'gemini-1.5-pro-latest' 

    try:
        # Use the client's async chat method
        response = await client.chats.send_message_async(
            model=model_name, # Pass the model name directly
            contents=conversation, # Pass the structured conversation history
            config=genai_types.GenerateContentConfig( # Pass configuration like system prompt
                system_instruction=system_prompt,
                # temperature=0.7, # Optional: uncomment to set temperature
            )
        )
        
        # Get the response text
        # The response object directly contains the text part
        response_text = response.text
        
        # Return the result in MCP format
        return mcp_types.CreateMessageResult(
            role="assistant",
            content=mcp_types.TextContent(
                type="text",
                text=response_text,
            ),
            model=model_name, # Report the model used
            stopReason="endTurn",
        )
    except Exception as e:
        # Handle potential errors during the API call
        return mcp_types.CreateMessageResult(
            role="assistant",
            content=mcp_types.TextContent(
                type="text",
                text=f"Error calling Gemini API: {str(e)}",
            ),
            stopReason="error",
        )

async def run_client():
    try: # Wrap the entire client operation for better error reporting
        async with stdio_client(server_params) as (read, write):
            print("stdio_client connected.")
            try: # Wrap the session and initial calls
                async with ClientSession(
                    read, write, sampling_callback=agent_callback
                ) as session:
                    print("ClientSession created.")
                    # Initialize the connection
                    print("Initializing session...")
                    await session.initialize()
                    print("Session initialized.")
                    
                    # List available tools
                    print("Listing tools...")
                    list_tools_result = await session.list_tools() # Store the result object
                    
                    # Access the .tools attribute for the list
                    print("Available tools:")
                    if list_tools_result and list_tools_result.tools: # Check if result and tools list exist
                        for tool in list_tools_result.tools:
                            # Access .name and .description from the Tool object
                            print(f"- {tool.name}: {tool.description}")
                    else:
                        print("No tools found or failed to retrieve tools.")

                    # Example: Use the tool to list files in the current directory
                    print("Calling list_directory tool...")
                    call_list_result = await session.call_tool("list_directory", {"directory_path": "."})
                    print(f"list_directory result received.")
                    # Extract text from the CallToolResult object
                    list_output = "Error retrieving directory listing." # Default message
                    if call_list_result and call_list_result.content and isinstance(call_list_result.content[0], mcp_types.TextContent):
                         list_output = call_list_result.content[0].text
                    print(f"\nFiles in current directory:\n{list_output}")
                    
                    # Example: Read a specific file
                    print("Calling read_file tool...")
                    file_to_read = "file_agent_server.py"
                    call_read_result = await session.call_tool("read_file", {"file_path": file_to_read})
                    print(f"read_file result received.")
                    # Extract text from the CallToolResult object
                    read_output = "Error reading file content." # Default message
                    if call_read_result and call_read_result.content and isinstance(call_read_result.content[0], mcp_types.TextContent):
                         read_output = call_read_result.content[0].text
                    # Now apply subscripting to the extracted text
                    print(f"\nContents of {file_to_read}:\n{read_output[:200]}...")
                    
                    # Interactive loop - real client would integrate with an interface
                    print("\nEnter messages (or type 'exit' to quit):")
                    while True:
                        user_input = input("> ")
                        if user_input.lower() == 'exit':
                            break
                        
                        try: # Add try/except around tool calls in the loop
                            result_text = "Error executing command." # Default message
                            tool_name = None
                            tool_params = None

                            if user_input.startswith("read "):
                                tool_name = "read_file"
                                tool_params = {"file_path": user_input[5:].strip()}
                            elif user_input.startswith("write "):
                                parts = user_input[6:].split(" ", 1)
                                if len(parts) == 2:
                                    tool_name = "write_file"
                                    tool_params = {"file_path": parts[0], "content": parts[1]}
                                else:
                                     print("Invalid write command format.")
                            elif user_input.startswith("list "):
                                 tool_name = "list_directory"
                                 tool_params = {"directory_path": user_input[5:].strip()}
                            else:
                                print("Unknown command. Use 'read <file>', 'write <file> <content>', or 'list <directory>'")
                                continue # Skip tool call if command is unknown

                            if tool_name and tool_params:
                                call_result = await session.call_tool(tool_name, tool_params)
                                # Extract text result similarly
                                if call_result and call_result.content and isinstance(call_result.content[0], mcp_types.TextContent):
                                    result_text = call_result.content[0].text
                                print(result_text)

                        except Exception as loop_err:
                             print(f"Error during interactive command: {loop_err}")
                             # import traceback
                             # traceback.print_exc()

            except Exception as session_err:
                # Catch errors specifically from session setup or initial calls
                print(f"\n!!! Error during ClientSession operations: {session_err} !!!")
                import traceback
                traceback.print_exc() # Print the full traceback

    except Exception as outer_err:
        # Catch errors from stdio_client connection or other top-level issues
        print(f"\n!!! Error during stdio_client setup or connection: {outer_err} !!!")
        import traceback
        traceback.print_exc() # Print the full traceback


if __name__ == "__main__":
    # Keep the outer try/except in main as a final fallback
    try:
        asyncio.run(run_client())
    except Exception as e:
        print(f"\n!!! Unhandled top-level error occurred: {e} !!!")
        # import traceback
        # traceback.print_exc()