import asyncio
from mcp.client.sse import sse_client
from mcp.client.stdio import stdio_client
from mcp import ClientSession, StdioServerParameters

OPERATOR_TOOL_MAP = {
    '+': 'add',
    '-': 'subtract',
    '*': 'multiply',
    '/': 'divide'
}

async def interactive_calculator(session: ClientSession):
    await session.initialize()
    print("Session initialized!")

    while True:
        try:
            a_input = input("Enter the first number (or 'exit' to quit): ").strip()
            if a_input.lower() == 'exit':
                break
            a = float(a_input)

            operator = input("Enter an operator (+, -, *, /): ").strip()
            if operator not in OPERATOR_TOOL_MAP:
                print("Invalid operator. Please enter one of +, -, *, /.")
                continue

            b_input = input("Enter the second number: ").strip()
            b = float(b_input)

            tool_name = OPERATOR_TOOL_MAP[operator]

            result = await session.call_tool(
                name=tool_name,
                arguments={"a": a, "b": b}
            )

            print(f"Result: {result.content[0].text}")

        except ValueError:
            print("Invalid input. Please enter numeric values for numbers.")
        except Exception as e:
            print(f"An error occurred: {e}")


async def main():
    transport = 'sse' # Replace with 'stdio' to use stdio transport
    
    if transport == 'sse':
        print("Starting calculator client with SSE...")
        
        server_url = "http://localhost:8001/sse"

        async with sse_client(server_url) as (readstream, writestream):
            async with ClientSession(readstream, writestream) as session:
                await interactive_calculator(session)
    else:
        print("Starting calculator client with stdio...")
        server_params = StdioServerParameters(
            command="python",
            args=['servers/calculator/main.py']
        )

        async with stdio_client(server_params) as (readstream, writestream):
            async with ClientSession(readstream, writestream) as session:
                await interactive_calculator(session)

if __name__ == "__main__":
    asyncio.run(main())