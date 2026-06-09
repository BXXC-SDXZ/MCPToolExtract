# GitLab PR Analysis MCP Server

This project provides an MCP (Model Control Protocol) server that integrates GitLab merge request analysis with Confluence documentation. It allows you to fetch merge request details, analyze code changes, and store the results in Confluence pages.

## Features

- Fetch merge request details from GitLab
- Analyze code changes in merge requests
- Generate detailed reports including:
  - Basic merge request information
  - Code change statistics
  - File type analysis
  - Detailed file changes
- Store analysis results in Confluence
- Comprehensive logging for debugging

## Prerequisites

- Python 3.8 or higher
- GitLab account with API access
- Confluence account (optional, for storing analysis results)
- Access to the required GitLab project(s)

## Installation

1. Clone the repository:
```bash
git https://github.com/CodeByWaqas/MRConfluenceLinker-mcp-server.git
cd MRConfluenceLinker-mcp-server
```

2. Create and activate a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows, use: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```
or
```bash
uv add "mcp[cli]" python-gitlab python-dotenv atlassian-python-api requests
```

## Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your credentials:
```env
GITLAB_URL=https://gitlab.com
GITLAB_TOKEN=your_gitlab_token
GITLAB_PROJECT_ID=your_project_id

# Optional Confluence integration
CONFLUENCE_URL=your_confluence_url
CONFLUENCE_USERNAME=your_username
CONFLUENCE_TOKEN=your_confluence_token
CONFLUENCE_SPACE=your_space_key
```

### Obtaining Credentials

- **GitLab Token**: Generate a personal access token in GitLab with `api` scope
- **Confluence Token**: Generate an API token in your Atlassian account settings

## Usage

1. Start the MCP server:
```bash
python src/MRConfluenceLinker-mcp-server/server.py
```
or 

### Setup with Claude Desktop
```json
# claude_desktop_config.json
# Can find location through:
# Claude -> Settings -> Developer -> Edit Config
{
  "mcpServers": {
      "MRConfluenceLinker-mcp-server": {
          "command": "uv",
          "args": [
              "--directory",
              "/<Absolute-path-to-folder>/MRConfluenceLinker-mcp-server/src/MRConfluenceLinker-mcp-server",
              "run",
              "server.py"
          ]
      }
  }
}

2. The server will listen for commands through stdin/stdout. You can interact with it using prompts like:

```
Can you fetch details for merge request #1 from project "my-project"?
Can you analyze code changes in merge request #1 from project "my-project"?
Can you store a summary of merge request #1 from project "my-project" in Confluence?
```

## Available Tools

The server provides the following tools:

1. `fetch_mr_details`: Fetches details of a specific merge request or all merge requests
   - Parameters:
     - `project_id`: The GitLab project ID
     - `mr_id` (optional): Specific merge request ID

2. `analyze_code_changes`: Analyzes code changes in a merge request
   - Parameters:
     - `project_id`: The GitLab project ID
     - `mr_id`: The merge request ID to analyze

3. `store_in_confluence`: Stores analysis results in Confluence
   - Parameters:
     - `project_id`: The GitLab project ID
     - `mr_id` (optional): Specific merge request ID
     - `analysis` (optional): Analysis results to store

## Logging

The server generates detailed logs in `mcp_server.log` and outputs to stderr. This helps in debugging issues with:
- GitLab API access
- Confluence integration
- Code analysis
- Page creation and updates

## Error Handling

The server includes comprehensive error handling for:
- Missing environment variables
- API authentication issues
- Network connectivity problems
- Invalid project or merge request IDs
- Confluence permission issues

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please [create an issue](https://github.com/CodeByWaqas/MRConfluenceLinker-mcp-server/issues) or contact the maintainers.

## Project Structure

```
MRConfluenceLinker-mcp-server/
├── src/                           # Source code directory
│   └── MRConfluenceLinker-mcp-server/  # Main server package
│       ├── resources/            # Resource modules
│       │   ├── __init__.py
│       │   ├── client.py        # Client implementation / GitLab PR integration
│       ├── server.py            # Main server implementation
│       └── mcp_server.log       # Server logs
├── __pycache__/                 # Python cache files
├── .git/                        # Git repository
├── .gitignore                   # Git ignore rules
├── CONTRIBUTING.md              # Contributing guidelines
├── LICENSE                      # Project license
├── README.md                    # Project documentation
├── pyproject.toml              # Python project configuration
├── requirements.txt            # Project dependencies
└── uv.lock                     # Dependency lock file
```

### Key Components

- **Source Code**: Located in the `src/MRConfluenceLinker-mcp-server/` directory
  - `server.py`: Main MCP server implementation
  - `resources/client.py`: Client-side implementation contains GitLab PR integration

- **Configuration Files**:
  - `requirements.txt`: Python package dependencies
  - `pyproject.toml`: Project metadata and build configuration
  - `uv.lock`: Locked dependency versions
  - `.env.example`: Environment variables template

- **Documentation**:
  - `README.md`: Project overview and setup instructions
  - `CONTRIBUTING.md`: Contribution guidelines
  - `LICENSE`: Project license

- **Development**:
  - `__pycache__/`: Python cache files
  - `mcp_server.log`: Server logs for debugging
