# MCP Server Template

A comprehensive template for building Model Context Protocol (MCP) servers with TypeScript/Node.js.

## Overview

This template provides a standardized structure and best practices for developing MCP servers. It includes:

- TypeScript configuration with ES Modules
- Standardized directory structure
- Error handling utilities
- Testing framework
- Example implementations
- Comprehensive documentation

## Quick Start

```bash
# Clone this repository
git clone https://github.com/your-org/mcp-server-template.git my-mcp-server

# Navigate to the project directory
cd my-mcp-server

# Install dependencies
npm install

# Build the project
npm run build

# Run the example server
npm start
```

## Quick Start with LLMs

This template is designed to work seamlessly with AI assistants like Claude to help you develop your MCP server:

1. Clone this repository:
   ```bash
   git clone https://github.com/your-org/mcp-server-template.git my-mcp-server
   cd my-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the prompt from one of these files and paste it into your conversation with Claude or another LLM:
   - `PROMPT_TEMPLATE.md` - For task-specific assistance with your MCP server
   - `AI_ASSISTANT_PROMPT.md` - For setting up an AI assistant with deep MCP expertise

4. Fill in the details about your specific MCP server requirements.

5. Work with the LLM to implement your custom tools, resources, and other functionality.

6. Test your implementation using the included test utilities:
   ```bash
   npm test
   ```

7. Deploy your MCP server according to your needs.

## Directory Structure

```
mcp-server-template/
├── package.json           # Configured for ES modules
├── tsconfig.json          # TypeScript configuration
├── README.md              # Documentation with usage examples
├── PROMPT_TEMPLATE.md     # Template for task-specific LLM assistance
├── AI_ASSISTANT_PROMPT.md # Role prompt for MCP development assistant
├── DEVELOPMENT_RULES.md   # Development guidelines
├── src/
│   ├── index.ts           # Main server implementation
│   ├── tools/             # Example tool implementations
│   │   └── example-tool.ts
│   ├── resources/         # Example resource implementations
│   │   └── example-resource.ts
│   └── utils/             # Helper utilities
│       └── error-handling.ts
├── tests/                 # Test scripts
│   └── server.test.js
├── docs/                  # Detailed documentation
│   ├── client-developers.md
│   ├── server-developers.md
│   ├── claude-users.md
│   └── mcp-reference.md
└── examples/              # Example implementations
    ├── weather-server/    # Weather API example
    ├── github-server/     # GitHub API example
    └── local-files-server/ # Local file system example
```

## Features

### MCP Server Implementation

The template includes a basic MCP server implementation with:

- Protocol version negotiation
- Capability declaration
- Tool registration and execution
- Resource management
- Error handling
- Logging

### Tools and Resources

Example implementations of:

- Basic tools with parameter validation
- Resource definitions with URI templates
- Prompt templates

### Testing

The template includes a testing framework for:

- Unit testing tools and resources
- Integration testing with MCP clients
- Mocking external dependencies

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- [Client Developers Guide](docs/client-developers.md)
- [Server Developers Guide](docs/server-developers.md)
- [Claude Users Guide](docs/claude-users.md)
- [MCP Reference](docs/mcp-reference.md)

## Development Rules

Please refer to [DEVELOPMENT_RULES.md](DEVELOPMENT_RULES.md) for guidelines on:

- Module system usage
- TypeScript best practices
- Error handling patterns
- Tool implementation rules
- Resource implementation rules
- Testing requirements
- Security guidelines

## Examples

The template includes several example implementations:

- **Weather Server**: Demonstrates API integration with the National Weather Service
- **GitHub Server**: Shows how to integrate with the GitHub API
- **Local Files Server**: Illustrates filesystem access and management

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
