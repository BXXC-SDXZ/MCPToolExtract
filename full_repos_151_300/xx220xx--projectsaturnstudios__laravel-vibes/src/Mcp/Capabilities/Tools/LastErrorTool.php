<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use stdClass;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Illuminate\Log\Events\MessageLogged;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Superconductor\LaravelVibes\Concerns\Boost\ReadsLogs;


#[ToolCall(
    tool: 'last-error',
    description: 'Get details of the last error/exception created in this application on the backend. Use browser-log tool for browser errors.',
    input_schema: [
        'type'   => 'object',
        'properties' => new stdClass(),
        'required' => []
    ]
)]
class LastErrorTool extends Tool
{
    use ReadsLogs;

    /**
     * Indicates whether the Log listener has been registered for this process.
     */
    private static bool $listenerRegistered = false;

    public function __construct()
    {
        // Register the listener only once per PHP process.
        if (! self::$listenerRegistered) {
            Log::listen(function (MessageLogged $event) {
                if ($event->level === 'error') {
                    Cache::forever('vibes:last_error', [
                        'timestamp' => now()->toDateTimeString(),
                        'level' => $event->level,
                        'message' => $event->message,
                        'context' => [], // $event->context,
                    ]);
                }
            });

            self::$listenerRegistered = true;
        }
    }

    public function handle(): array
    {
        // First, attempt to retrieve the cached last error captured during runtime.
        // This works even if the log driver isn't a file driver, so is the preferred approach
        $cached = Cache::get('vibes:last_error');
        if ($cached) {
            $entry = "[{$cached['timestamp']}] {$cached['level']}: {$cached['message']}";
            if (! empty($cached['context'])) {
                $entry .= ' '.json_encode($cached['context']);
            }

            return [[
                'type' => 'text',
                'text' => $entry
            ]];
        }

        // Locate the correct log file using the shared helper.
        $logFile = $this->resolveLogFilePath();

        if (! file_exists($logFile)) {
            return [[
                'type' => 'text',
                'text' => "Log file not found at {$logFile}"
            ]];
        }

        $entry = $this->readLastErrorEntry($logFile);

        if ($entry !== null) {
            return [[
                'type' => 'text',
                'text' => $entry
            ]];
        }

        return [[
            'type' => 'text',
            'text' => 'Unable to find an ERROR entry in the inspected portion of the log file.'
        ]];
    }
}
