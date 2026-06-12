<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Illuminate\Support\Facades\Config;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;

#[ToolCall(
    tool: 'get-config',
    description: 'Get the value of a specific config variable using dot notation (e.g., "app.name", "database.default")',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'key' => [
                'type'        => 'string',
                'description' => 'Get the value of a specific config variable using dot notation (e.g., "app.name", "database.default").'
            ]
        ],
        'required' => ['key']
    ]
)]
class ConfigTool extends Tool
{
    public function handle(string $key): array
    {
        if (! Config::has($key)) {
            return [[
                'type' => 'text',
                'text' => "Config key '{$key}' not found."
            ]];
        }

        return [
            [
                'type'  => 'text',
                'text'  => json_encode([
                    'key' => $key,
                    'value' => Config::get($key),
                ])
            ]
        ];
    }
}
