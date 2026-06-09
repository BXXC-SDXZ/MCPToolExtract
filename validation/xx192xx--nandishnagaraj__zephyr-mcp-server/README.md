# Zephyr MCP Server

A Model Context Protocol (MCP) server for integrating with Zephyr Scale.

## Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/nandishnagaraj/zephyr-mcp-server.git
   cd zephyr-mcp-server
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure VS Code:
   - Open your VS Code settings (JSON)
   - Add the following to your MCP configuration:
   ```json
   {
     "mcpServers": {
       "zephyr": {
         "command": "python",
         "args": ["zephyr/zephyr.py"]
       }
     }
   }
   ```

4. Set your Zephyr Scale API token:
   - Create a `.env` file in the project root
   - Add your API token:
   ```
   ZEPHYR_API_TOKEN=your_api_token_here
   ```

## Features

- Fetch test cases from Zephyr Scale
- Filter by project key and folder ID
- Limit number of results

## Usage

The server provides the following tools:
- `get_test_cases`: Fetch test cases from Zephyr Scale
  - Parameters:
    - `project_key`: Project key (e.g., "SM")
    - `folder_id`: (Optional) Folder ID to filter test cases
    - `max_results`: Maximum number of test cases to return (default: 10)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request