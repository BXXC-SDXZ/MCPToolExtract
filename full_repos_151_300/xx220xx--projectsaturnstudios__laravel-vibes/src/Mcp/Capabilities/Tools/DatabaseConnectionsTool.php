<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use stdClass;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;

#[ToolCall(
    tool: 'database-connections',
    description: 'List the configured database connection names for this application.',
    input_schema: [
        'type'   => 'object',
        'properties' => new stdClass(),
        'required' => []
    ]
)]
class DatabaseConnectionsTool extends Tool
{
    public function handle(): array
    {
        $connections = array_keys(config('database.connections', []));
        return [[
            'type' => 'text',
            'text' => json_encode([
                'default_connection' => config('database.default'),
                'connections' => $connections,
            ])
        ]];
    }
}
