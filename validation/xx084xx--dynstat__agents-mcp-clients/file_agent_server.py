# file_agent_server.py
from mcp.server.fastmcp import FastMCP
import os

# Create a FastMCP server
file_agent = FastMCP("File Operations Agent")

@file_agent.tool()
def read_file(file_path: str) -> str:
    """Read the contents of a file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        return f"Error reading file: {str(e)}"

@file_agent.tool()
def write_file(file_path: str, content: str) -> str:
    """Write content to a file."""
    try:
        # Ensure the directory exists
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return f"Successfully wrote to {file_path}"
    except Exception as e:
        return f"Error writing to file: {str(e)}"

@file_agent.tool()
def list_directory(directory_path: str) -> str:
    """List files in a directory."""
    try:
        # Get absolute path of the directory
        abs_path = os.path.abspath(directory_path)
        current_path = os.getcwd()
        files = os.listdir(directory_path)
        return f"Current path: {current_path}\nCurrent directory: {abs_path}\n\nFiles:\n" + "\n".join(files)
    except Exception as e:
        return f"Error listing directory: {str(e)}"

if __name__ == "__main__":
    file_agent.run()