<?php

namespace Superconductor\LaravelVibes\Servers;

use Superconductor\Mcp\Servers\MCPServer;

class VibesServer extends MCPServer
{
    protected ?array $server_info = [
        'name' => 'Laravel Vibes',
        'version' => '0.6.0'
    ];

    protected array $server_capabilities = [
        'logging'   => [],
        'resources' => [
            'subscribe'   => true,
            'listChanged' => true,
        ],
        'tools'     => [
            'listChanged' => true,
        ],
        'prompts'   => [
            'listChanged' => true,
        ],
    ];

    protected array $tools = [
        'tinker', 'get-absolute-url', 'application-info',
        'read-log-entries', 'list-artisan-commands',
        'browser-logs', 'list-available-config-keys',
        'get-config', 'database-connections', 'database-query',
        'database-schema', 'list-available-env-vars',
        'list-routes', 'last-error', 'search-docs'
    ];

    protected array $resources = [
        'laravel-boost-rules.md'
    ];

    protected array $prompts = [
        'read-logs'
    ];
}
