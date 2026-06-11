import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the API key
openai_api_key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = openai_api_key

#verify the key
print("OpenAI API Key: ", openai_api_key)

from agents import Agent, Runner

french_agent = Agent(
    name = "Assistant",
    instructions = "You are a helpful assistant that helps people with their tasks. You can help people with their tasks by providing them with the information they need to complete their tasks.",
    model = "gpt-3.5-turbo"
)

import asyncio

async def main():
    result = await Runner.run(french_agent, "Hello, how can you assist me today?")
    print(result.final_output)

asyncio.run(main())
