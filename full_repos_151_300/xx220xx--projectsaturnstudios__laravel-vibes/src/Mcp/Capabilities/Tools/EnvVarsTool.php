<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;



use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;

#[ToolCall(
    tool: 'list-available-env-vars',
    description: '🔧 List all available environment variable names from a given .env file (default .env).',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'filename' => [
                'type' => 'string',
                'description' => 'The name of the .env file to read (e.g. .env, .env.example). Defaults to .env if not provided.',
            ]
        ],
        'required' => []
    ]
)]
class EnvVarsTool extends Tool
{
    public function handle(?string $filename = null): array
    {
        $filename ??= '.env';

        $filePath = base_path($filename);

        if (! str_contains($filePath, '.env')) {
            return [[
                'type' => 'text',
                'text' => 'This tool can only read .env files'
            ]];
        }

        if (! file_exists($filePath)) {
            return [[
                'type' => 'text',
                'text' => "File not found at '{$filePath}'"
            ]];
        }

        $envLines = file_get_contents($filePath);

        if (! $envLines) {
            return [[
                'type' => 'text',
                'text' => 'Failed to read .env file.'
            ]];
        }

        $count = preg_match_all('/^(?!\s*#)\s*([^=\s]+)=/m', $envLines, $matches);

        if (! $count) {
            return [[
                'type' => 'text',
                'text' => 'Failed to parse .env file'
            ]];
        }

        $envVars = array_map('trim', $matches[1]);

        sort($envVars);

        return [
            [
                'type' => 'text',
                'text' => json_encode($envVars),
            ]
        ];
    }
}
