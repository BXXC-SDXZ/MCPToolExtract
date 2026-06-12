<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;


use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Superconductor\LaravelVibes\Concerns\Boost\ReadsLogs;

#[ToolCall(
    tool: 'read-log-entries',
    description: 'Read the last N log entries from the APPLICATION log, correctly handling multi-line PSR-3 formatted logs. Only works for log files',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'entries' => [
                'type'        => 'integer',
                'description' => 'Number of log entries to return.'
            ]
        ],
        'required' => ['entries']
    ]
)]
class AppLogsTool extends Tool
{
    use ReadsLogs;

    public function handle(int $entries) {
        $maxEntries = $entries;

        if ($maxEntries <= 0) {
            return [
                [
                    'type' => 'text',
                    'text' => 'The "entries" argument must be greater than 0.',
                ]
            ];
        }

        // Locate the correct log file using the shared helper.
        $logFile = $this->resolveLogFilePath();

        if (! file_exists($logFile)) {
            return [[
                'type' => 'text',
                'text' => 'No log file found, probably means no logs yet.'
            ]];
        }

        $entries = $this->readLastLogEntries($logFile, $maxEntries);

        if ($entries === []) {
            return [[
                'type' => 'text',
                'text' => 'Unable to retrieve log entries, or no logs'
            ]];
        }

        $logs = implode("\n\n", $entries);

        $logs = implode("\n\n", $entries);
        if (empty(trim($logs))) {
            return [[
                'type' => 'text',
                'text' => 'No log entries yet.'
            ]];
        }

        return [[
            'type' => 'text',
            'text' => json_encode($logs)
        ]];
    }
}
