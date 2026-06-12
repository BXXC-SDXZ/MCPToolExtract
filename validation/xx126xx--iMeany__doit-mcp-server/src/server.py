import json
import os
import subprocess

from mcp.server.fastmcp import FastMCP

# Create an MCP server
host = os.getenv("DOIT_MCP_HOST", "127.0.0.1")  # Default host
port = int(os.getenv("DOIT_MCP_PORT", 5000))    # Default port
mcp = FastMCP("Doit MCP Server", host=host, port=port)

# Add a configuration for the path to the doit file
doit_file_path = os.getenv("DOIT_FILE_PATH", "c:/projects/doit-mcp/src/dodo.py")

@mcp.tool()
def run_doit_task(task_name: str, **kwargs) -> str:
    """Run a doit task by name with optional parameters."""

    # Prepare the command
    command = ["doit", "--file", doit_file_path, task_name]
    for key, value in kwargs.items():
        command.append(f"--{key}={value}")

    try:
        # Run the command and capture output
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error running task {task_name}: {e.stderr}"

@mcp.resource("resource://list-doit-tasks")
def list_doit_tasks() -> str:
    """List all available doit tasks."""
    import subprocess

    # Prepare the command
    command = ["doit", "--file", doit_file_path, "list"]

    try:
        # Run the command and capture output
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        return result.stdout
    except subprocess.CalledProcessError as e:
        return f"Error listing tasks: {e.stderr}"

if __name__ == "__main__":
    print(f"Starting Doit MCP Server on {host}:{port}")
    mcp.run()

