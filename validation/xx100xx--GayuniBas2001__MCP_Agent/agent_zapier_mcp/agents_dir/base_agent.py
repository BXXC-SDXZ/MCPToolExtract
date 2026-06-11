import os
from dotenv import load_dotenv

import asyncio
from typing import TYPE_CHECKING
from openai.types.responses import ResponseTextDeltaEvent
if TYPE_CHECKING:
    pass

# from agents import Agent, Runner
from agents import Runner, function_tool
from agents_mcp import Agent, RunnerContext

from mcp_agent.config import MCPServerSettings, MCPSettings

# Load environment variables from .env file
load_dotenv()

# Get the API key
openai_api_key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = openai_api_key

#verify the key
#print("OpenAI API Key: ", openai_api_key)
print("OpenAI API Key verified")

# Define a simple local tool to demonstrate combining local and MCP tools
@function_tool
def get_current_weather(location: str) -> str:
    """
    Get the current weather for a location.

    Args:
        location: The city and state, e.g. "San Francisco, CA"

    Returns:
        The current weather for the requested location
    """
    return f"The weather in {location} is currently sunny and 72 degrees Fahrenheit."

async def main():

    # Specify a custom config path if needed, or set to None to use default discovery
    # mcp_config_path = "mcp_agent_config.yaml"   
    mcp_config_path = None

    mcp_config = MCPSettings(
        servers={
            "zapier-mcp": MCPServerSettings(
                        command = "npx",
                        args = [
                            "mcp-remote",
                            "https://actions.zapier.com/mcp/sk-ak-DBmR4BcjJApuOBFQu6SG4kPTjj/sse",
                        ]
            ),
        }
    )

    # Create a context object containing MCP settings
    context = RunnerContext(mcp_config_path=mcp_config_path, mcp_config=mcp_config)

    agent: Agent = Agent(
        name="MCP Assistant",
        instructions="""You are a helpful assistant with access to both MCP server tools.
        if you don't have the information you need, you can ask the MCP servers for help.""",
        # tools=[get_current_weather],  # Local and OpenAI tools
        mcp_servers=[
            "zapier-mcp"
        ], 
        mcp_server_registry=None, 
    )

    print("Starting Runner.run...")

    user_input = input("Enter your prompt: ")
    # user_input="Send an email to gayunibas@gmail.com wishing her for her birthday. You can construct the content however you like"
    # user_input="What is the content of the last email I have received?"
    # user_input="Who are the senders of the 3 most recent emails?"

    print("Starting Runner.run_streamed...")
    result = Runner.run_streamed(
        agent,
        input=user_input,
        context=context,
    )

    try:
        print("Starting to stream events...")
        async for event in result.stream_events():
            print("Event received:", event)
            if event.type == "raw_response_event" and isinstance(event.data, ResponseTextDeltaEvent):
                print("/nHeyy", end="", flush=True)
            elif event.type == "raw_response_event" and hasattr(event.data, "status") and event.data.status == "completed":
                print("\nResponse completed.")
                break  # Exit loop when response is complete
    except asyncio.CancelledError:
        print("Stream cancelled")
    except Exception as e:
        print("Error while streaming events:", e)

    
asyncio.run(main())
