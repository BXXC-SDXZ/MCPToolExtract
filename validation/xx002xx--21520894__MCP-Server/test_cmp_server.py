from mcp import ClientSession
from mcp.client.sse import sse_client

async def check():
    async with sse_client ("http://localhost:8000/sse") as (read_stream, write_stream):
        async with ClientSession(read_stream, write_stream) as session:
            # Call the add function
            await session.initialize()

            #List avaiable tools
            tools = await session.list_tools()
            print ("List tool: ", tools)



if __name__ == "__main__":
    import asyncio
    asyncio.run(check())
