<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Throwable;
use Illuminate\Support\Facades\DB;

#[ToolCall(
    tool: 'database-query',
    description: 'Execute a read-only SQL query against the configured database.',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'query' => [
                'type'        => 'string',
                'description' => 'The SQL query to execute. Only read-only queries are allowed (i.e. SELECT, SHOW, EXPLAIN, DESCRIBE).'
            ],
            'database' => [
                'type'        => 'string',
                'description' => "Optional database connection name to use. Defaults to the application's default connection."
            ]
        ],
        'required' => ['query']
    ]
)]
class DatabaseQueryTool extends Tool
{
    public function handle(string $query, ?string $database = null): array
    {
        $token = strtok(ltrim($query), " \t\n\r");
        if (! $token) {
            return [[
                'type' => 'text',
                'text' => 'Please pass a valid query'
            ]];
        }
        $firstWord = strtoupper($token);

        // Allowed read-only commands.
        $allowList = [
            'SELECT',
            'SHOW',
            'EXPLAIN',
            'DESCRIBE',
            'DESC',
            'WITH',        // SELECT must follow Common-table expressions
            'VALUES',      // Returns literal values
            'TABLE',       // PostgresSQL shorthand for SELECT *
        ];

        $isReadOnly = in_array($firstWord, $allowList, true);

        // Additional validation for WITH … SELECT.
        if ($firstWord === 'WITH') {
            if (! preg_match('/with\s+.*select\b/i', $query)) {
                $isReadOnly = false;
            }
        }

        if (! $isReadOnly) {
            return [[
                'type' => 'text',
                'text' => 'Only read-only queries are allowed (SELECT, SHOW, EXPLAIN, DESCRIBE, DESC, WITH … SELECT).'
            ]];
        }

        $connectionName = $database ?? null;

        try {
            return [[
                'type' => 'text',
                'text' => json_encode(DB::connection($connectionName)->select($query))
            ]];
        } catch (Throwable $e) {
            return [[
                'type' => 'text',
                'text' => 'Query failed: '.$e->getMessage()
            ]];
        }
    }
}
