<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Superconductor\LaravelVibes\Concerns\Boost\ReadsLogs;

#[ToolCall(
    tool: 'browser-logs',
    description: 'Read the last N log entries from the BROWSER log. Very helpful for debugging the frontend and JS/Javascript',
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
class BrowserLogsTool extends Tool
{
    use ReadsLogs;

    public function handle(int $entries) {
        $maxEntries = $entries;

        if ($maxEntries <= 0) {
            return [[
                'type' => 'text',
                'text' => 'The "entries" argument must be greater than 0.'
            ]];
        }

        // Locate the correct log file using the shared helper.
        $logFile = storage_path('logs/browser.log');

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
