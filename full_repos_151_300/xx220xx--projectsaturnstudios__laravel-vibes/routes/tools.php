<?php

use Superconductor\Capabilities\Tools\Support\Facades\MCP;

MCP::tool('tinker', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\TinkerTool::class);
MCP::tool('get-absolute-url', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\AbsoluteUrlTool::class);
MCP::tool('application-info', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\AppInfoTool::class);
MCP::tool('read-log-entries', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\AppLogsTool::class);
MCP::tool('list-artisan-commands', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\ArtisanCommandsTool::class);
MCP::tool('browser-logs', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\BrowserLogsTool::class);
MCP::tool('list-available-config-keys', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\ConfigKeysTool::class);
MCP::tool('get-config', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\ConfigTool::class);
MCP::tool('database-connections', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\DatabaseConnectionsTool::class);
MCP::tool('database-query', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\DatabaseQueryTool::class);
MCP::tool('database-schema', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\DatabaseSchemaTool::class);
MCP::tool('list-available-env-vars', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\EnvVarsTool::class);
MCP::tool('last-error', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\LastErrorTool::class);
MCP::tool('list-routes', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\ListRoutesTool::class);
MCP::tool('search-docs', \Superconductor\LaravelVibes\Mcp\Capabilities\Tools\SearchDocsTool::class);
