<p align="center">
  <img src="./public/logo.png" width="68" alt="MCPSvr logo" />
</p>

# MCPSvr

> A community-driven directory for discovering, reviewing, and contributing MCP servers.

<p align="center">
  <a href="https://github.com/nanbingxyz/mcpsvr/stargazers"><img src="https://img.shields.io/github/stars/nanbingxyz/mcpsvr?style=flat-square" alt="GitHub stars" /></a>
  <a href="https://github.com/nanbingxyz/mcpsvr/commits/master"><img src="https://img.shields.io/github/last-commit/nanbingxyz/mcpsvr?style=flat-square" alt="Last commit" /></a>
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/MCP-community%20directory-6f42c1?style=flat-square" alt="Community directory" />
</p>

[中文说明](./README_cn.md)

MCPSvr is a lightweight web directory for Model Context Protocol servers. It helps developers browse available servers, understand how each one is configured, and contribute new entries through pull requests.

The repository centers on a curated `public/servers.json` registry, so MCP clients such as [5ire](http://github.com/nanbingxyz/5ire) can install and run supported servers directly.

https://github.com/user-attachments/assets/3d1ec8db-2041-4f2d-b72c-eb8ae17ab31c

## Table of Contents
- [Why MCPSvr](#why-mcpsvr)
- [What You Can Do](#what-you-can-do)
- [Project Structure](#project-structure)
- [Run Locally](#run-locally)
- [How to Add a Server](#how-to-add-a-server)
- [Server Schema](#server-schema)
- [Parameter Placeholders](#parameter-placeholders)
- [Contribution Notes](#contribution-notes)

## Why MCPSvr

MCP servers are growing fast, but good discovery is still fragmented. MCPSvr gives the ecosystem a simple shared registry with enough metadata for humans to evaluate tools and for clients to automate setup.

## What You Can Do

- Discover MCP servers from a single browsable directory
- Review runtime commands, arguments, environment variables, and homepage links
- Contribute new servers or improve existing metadata via pull requests
- Reuse the registry in MCP clients that support direct installation

## Project Structure

```text
.
├── app/                # Next.js app router pages
├── components/         # Reusable UI components
├── lib/                # Utility helpers
├── public/
│   ├── logo.png
│   └── servers.json    # Central MCP server registry
└── README_cn.md        # Chinese README
```

## Run Locally

### Prerequisites
- Node.js 18+
- npm (or another package manager compatible with `package-lock.json`)

### Install
```bash
npm install
```

### Start the development server
```bash
npm run dev
```

Then open `http://localhost:3000`.

### Build for production
```bash
npm run build
npm run start
```

## How to Add a Server

All registered MCP servers are maintained in `public/servers.json`. To contribute a new entry:

1. Fork the repository
2. Add or update a server object in `public/servers.json`
3. Keep keys consistently ordered
4. Open a pull request with links to the project homepage or docs

## Server Schema

```json
{
  "name": "Server Identifier",
  "key": "Unique alphanumeric identifier",
  "description": "Concise implementation overview",
  "command": "Execution environment specifier (for example uvx, npx, python, node)",
  "args": [
    "Required runtime arguments"
  ],
  "env": {
    "ENVIRONMENT_VARIABLE": "Value assignment"
  },
  "homepage": "Official documentation URL"
}
```

### Field Guidelines
- `key` must be unique, alphanumeric, and start with a letter
- `name` is optional and falls back to `key` when omitted
- `env` and `homepage` are optional but strongly recommended
- Keep descriptions short and practical so clients can display them cleanly

## Parameter Placeholders

When a server needs user-provided input, use the placeholder format below:

```text
{{paramName@paramType::paramDescription}}
```

Example:

```json
{
  "name": "File System Access Control",
  "key": "FileSystem",
  "command": "npx",
  "description": "Enforces directory-level operation restrictions through specified arguments",
  "args": [
    "-y",
    "@modelcontextprotocol/server-filesystem",
    "{{dirs@list::directories you are about to access, include trailing slash}}"
  ],
  "homepage": "https://github.com/modelcontextprotocol/servers"
}
```

Supported placeholder types include `string`, `list`, and `number`.

## Contribution Notes

- Prefer accurate metadata over marketing copy
- Double-check command arguments before submitting
- Include a homepage or docs link whenever possible
- If you add a new field in the future, keep the schema backwards compatible for downstream clients
