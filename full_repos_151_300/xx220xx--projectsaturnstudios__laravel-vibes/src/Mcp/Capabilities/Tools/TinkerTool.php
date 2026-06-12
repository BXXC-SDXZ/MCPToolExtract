<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Exception;
use Throwable;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;

#[ToolCall(
    tool: 'tinker',
    description: 'Execute PHP code in the Laravel application context, like artisan tinker.
Use this for debugging issues, checking if functions exist, and testing code snippets.
You should not create models directly without explicit user approval. Prefer Unit/Feature tests using factories for functionality testing. Prefer existing artisan commands over custom tinker code.
Returns the output of the code, as well as whatever is "returned" using "return".',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'code' => [
                'type'        => 'string',
                'description' => 'PHP code to execute (without opening <?php tags).'
            ],
            'timeout' => [
                'type'        => 'integer',
                'description' => 'Maximum execution time in seconds (default: 30)'
            ]
        ],
        'required' => ['code']
    ]
)]
class TinkerTool extends Tool
{
    public function handle(string $code, int $timeout = 30): array
    {
        set_time_limit($timeout);
        ini_set('memory_limit', '128M');

        // Use PCNTL alarm for additional timeout control if available (Unix only)
        if (function_exists('pcntl_async_signals') && function_exists('pcntl_signal')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGALRM, function () {
                throw new Exception('Code execution timed out');
            });
            pcntl_alarm($timeout);
        }

        ob_start();

        try {
            $result = eval($code);

            if (function_exists('pcntl_alarm')) {
                pcntl_alarm(0);
            }

            $output = ob_get_contents();
            ob_end_clean();

            $response = [
                'result' => $result,
                'output' => $output,
                'type' => gettype($result),
            ];

            // If a result is an object, include the class name
            if (is_object($result)) {
                $response['class'] = get_class($result);
            }

            return [
                [
                    'type' => 'text',
                    'text' => "Executed code:\n```php\n{$code}\n```\n\n" .
                        "Output:\n```\n{$output}\n```\n\n" .
                        "Result: " . json_encode($response, JSON_PRETTY_PRINT) . "\n\n" .
                        "Type: " . gettype($result) . "\n"
                ]
            ];

        } catch (Throwable $e) {
            if (function_exists('pcntl_alarm')) {
                pcntl_alarm(0);
            }

            ob_end_clean();

            return [
                [
                    'type' => 'text',
                    'text' => implode("\n", [
                        'error' => $e->getMessage(),
                        'type' => get_class($e),
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ]),
                ]
            ];
        }
    }
}
