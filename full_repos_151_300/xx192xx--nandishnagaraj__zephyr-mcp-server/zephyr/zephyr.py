from typing import Any, Dict, Optional
import json
import os
from dotenv import load_dotenv
import httpx
from mcp.server.fastmcp import FastMCP

# Load environment variables
load_dotenv()

# Initialize FastMCP server
mcp = FastMCP("zephyr")

ZEPHYR_API_BASE = "https://api.zephyrscale.smartbear.com/v2"
API_TOKEN = os.getenv("ZEPHYR_API_TOKEN")

if not API_TOKEN:
    raise ValueError("ZEPHYR_API_TOKEN environment variable is not set")

async def make_zephyr_request(url: str) -> Dict[str, Any]:
    """Make a request to the Zephyr Scale API with proper error handling."""
    headers = {
        "Authorization": f"Bearer {API_TOKEN}",
        "Content-Type": "application/json"
    }
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
    except Exception as e:
        print(f"Error fetching test cases: {str(e)}")
        return {"values": []}

@mcp.tool()
async def get_test_cases(project_key: str, folder_id: Optional[int] = None, max_results: int = 10) -> str:
    """Get test cases from Zephyr Scale.

    Args:
        project_key: Project key (e.g. SM)
        folder_id: Optional folder ID to filter test cases
        max_results: Maximum number of test cases to return (default: 10)
    """
    url = f"{ZEPHYR_API_BASE}/testcases?projectKey={project_key}&maxResults={max_results}"
    if folder_id:
        url += f"&folderId={folder_id}"

    data = await make_zephyr_request(url)
    test_cases = data.get("values", [])
    
    if not test_cases:
        return "No test cases found."
    
    result = []
    for tc in test_cases:
        result.append({
            "name": tc.get("name", "Unknown"),
            "key": tc.get("key", "Unknown"),
            "priority": tc.get("priority", {}).get("id", "Unknown"),
            "status": tc.get("status", {}).get("id", "Unknown"),
            "objective": tc.get("objective", "No objective provided"),
            "precondition": tc.get("precondition", "No precondition provided")
        })
    
    return json.dumps(result, indent=2)

if __name__ == "__main__":
    # Initialize and run the server
    mcp.run(transport='stdio')