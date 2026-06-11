# Dominican Congress MCP Server

This MCP server provides access to information about the Dominican Congress, including legislative agendas, legislator activity, and new bills.

## Tools

*   **fetch-legislative-agenda:** Fetches the legislative agenda for a given chamber.
    *   Parameters:
        *   `chamber` (string, required): The chamber to fetch the agenda for. Must be either `"senado"` or `"diputados"`.
*   **get-legislator-activity:** Gets the activity for a given legislator.
    *   Parameters:
        *   `name` (string, required): The name of the legislator.
*   **summarize-today:** Summarizes today's legislative activity.
    *   Parameters: None
*   **new bills:** Fetches new bills for a given chamber.
    *   Parameters:
        *   `chamber` (string, required): The chamber to fetch the new bills for. Must be either `"senado"` or `"diputados"`.
*   **parse-pdf:** Parses a PDF file from a given URL.
    *   Parameters:
        *   `pdfUrl` (string, required): The URL of the PDF file.
*   **datos-abiertos:** Queries the datos.gob.do API.
    *   Parameters:
        *   `q` (string, optional): The search query.
        *   `organization` (string, optional): The organization to filter by.
        *   `tags` (string, optional): The tags to filter by.
        *   `groups` (string, optional): The groups to filter by.
        *   `skip` (string, optional): The number of results to skip.
*   **parse-csv:** Parses a CSV file from a given URL.
    *   Parameters:
        *   `csvUrl` (string, required): The URL of the CSV file.
*   **parse-xlsx:** Parses an XLSX file from a given URL.
    *   Parameters:
        *   `xlsxUrl` (string, required): The URL of the XLSX file.

## Resource Templates

*   **bulletin://{date}**: Daily bulletin for a given date.

## Installation

1.  Clone this repository: `git clone https://github.com/EnzoVezzaro/mcp-dominican-layer.git`
2.  Navigate to the repository directory: `cd mcp-dominican-layer`
3.  Install the dependencies: `npm install`
4.  Build the project: `npm run build`

## Integrating into your MCP Client

These steps assume you are using the [mcp-dominican-layer](https://github.com/EnzoVezzaro/mcp-dominican-layer.git) client.

1.  **Configure the MCP Server:**
    *   Open your MCP client's configuration file (likely `~/Library/Application Support/Code/User/globalStorage/saoudrizwan.claude-dev/settings/cline_mcp_settings.json` or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS).
    *   Add the following configuration for the Dominican Congress MCP server:

```json
{
  "mcpServers": {
    "dominican-congress": {
      "command": "node",
      "args": ["/path/to/dominicans-mcp/build/index.js"],
      "env": {}
    }
  }
}
```

    *   Replace `/path/to/dominicans-mcp` with the actual path to the cloned repository.

2.  **Discover the Tools:**
    *   Your MCP client should automatically discover the tools provided by the server after it's configured and running. You may need to restart your MCP client for it to recognize the new server.

3.  **Use the Tools:**
    *   Use the appropriate tool based on the task you want to perform. For example, to fetch the legislative agenda for the senate, you would use the `fetch-legislative-agenda` tool with the `chamber` parameter set to `"senado"`.

Example:

```json
{
  "server_name": "dominican-congress",
  "tool_name": "fetch-legislative-agenda",
  "arguments": {
    "chamber": "senado"
  }
}
```

## Notes

*   Make sure the path to `build/index.js` in the configuration file is correct.
*   If you encounter issues, check the console output of the MCP server for any error messages.
*   This MCP server requires Node.js and npm to be installed on your system.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Code of Conduct

Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Contributing

We welcome contributions to this project! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to contribute.

## Author

Enzo Vezzaro

## GitHub Repository

[https://github.com/EnzoVezzaro/mcp-dominican-layer](https://github.com/EnzoVezzaro/mcp-dominican-layer)

If you'd like to contribute to this project, please submit a pull request!

## Reporting Issues

Please report any issues you encounter on the [issue tracker](https://github.com/EnzoVezzaro/mcp-dominican-layer/issues).

