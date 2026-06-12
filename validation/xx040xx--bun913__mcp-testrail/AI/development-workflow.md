# MCP TestRail Development Workflow

## Overview
This project is a TypeScript-based MCP (Model Context Protocol) server that integrates with TestRail.

## Development Environment Setup

```bash
# Install dependencies
npm install

# Set up environment variables (create .env file)
# TESTRAIL_URL=https://your-testrail-instance.testrail.io
# TESTRAIL_USERNAME=your-username
# TESTRAIL_API_KEY=your-api-key
```

## Basic Development Flow

### 1. Development Server
```bash
# Start development server (using fastmcp)
npm run start:fastmcp
```

### 2. Code Quality
```bash
# Format code (Biome)
npm run format

# Run tests (Vitest + coverage)
npm test
```

### 3. Build and Run
```bash
# Compile TypeScript
npm run build

# Start MCP server (stdio mode)
npm run start:stdio

# Or SSE mode
npm start
```

### 4. Debugging
```bash
# Debug using MCP Inspector
npm run debug
```

This command:
- Launches MCP Inspector (ports 6274/6277)
- Runs `dist/server/server.js` in debug mode
- Provides browser-based debugging UI

## Project Structure

```
src/
├── client/       # TestRail API client
├── server/       # MCP server implementation
├── shared/       # Common schemas and types
├── stdio.ts      # stdio mode entry point
└── sse.ts        # SSE mode entry point
```

## CI/CD Flow

```bash
# CI tests (silent execution)
npm run test:ci

# Automatic build before publishing
npm run prepublishOnly
```

## Execution Modes

1. **Development**: `npm run start:fastmcp` for instant development
2. **Production**: `npm run build` → `npm start` or `npm run start:stdio`
3. **Debug**: `npm run debug` for detailed debugging with MCP Inspector
4. **Testing**: `npm test` for complete test suite execution

## Node.js Version Requirements
- Node.js 20.18.1 ~ 22.14.0