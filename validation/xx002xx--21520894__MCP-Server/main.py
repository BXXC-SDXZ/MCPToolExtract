from mcp.server.fastmcp import FastMCP

mcp = FastMCP(
    name = "mcp-server"
)

@mcp.tool()
def add (a: int, b: int) -> int:
    # add two numbers
    return a + b

def get_weather_temperature (city: str) -> str:
    #call the weather API to get the temperature of the city
    return "20 decrees celsius"

#resource: Cung cấp tài nguyên nào đó 
#prompt: query lên để lấy prompt cho 1 tình huống nào đó

#Resource
@mcp.resource("resource://ma_so_thue")
def get_tax_code() ->str:
    return "123456789"

@mcp.resource("resource://say_hi/{name}")
def say_hi (name :str) -> str:
    return "hello {}".format(name)

#Prompt
@mcp.prompt()
def review_sentence (sentance: str) -> str:
    return "remove this sentance, remove any personal information: \n \n{}".format(sentance)

if __name__ == "__main__":
    print ("--Listening for MCP server --")
    mcp.run(transport="sse")