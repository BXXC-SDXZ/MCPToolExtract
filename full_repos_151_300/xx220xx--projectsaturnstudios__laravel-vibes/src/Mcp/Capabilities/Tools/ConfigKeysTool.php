<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use stdClass;
use Illuminate\Support\Facades\Config;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;

#[ToolCall(
    tool: 'list-available-config-keys',
    description: 'List all available Laravel configuration keys (from config/*.php) in dot notation.',
    input_schema: [
        'type'   => 'object',
        'properties' => new stdClass(),
        'required' => []
    ]
)]
class ConfigKeysTool extends Tool
{
    public function handle(): array
    {
        $configArray = Config::all();
        $dotKeys = $this->flattenToDotNotation($configArray);
        sort($dotKeys);

        return [
            [
                'type' => 'text',
                //'text' => implode(',', $dotKeys),
                'text' => json_encode($dotKeys),
            ]
        ];
    }
//https://jovian.projectsaturnstudios.test/api/sse?using=vibes
    /**
     * Flatten a multi-dimensional config array into dot notation keys.
     *
     * @param array<int|string, string|array<int|string, string>> $array
     * @return array<int|string, int|string>
     */
    private function flattenToDotNotation(array $array, string $prefix = ''): array
    {
        $results = [];

        foreach ($array as $key => $value) {
            $currentKey = $prefix.$key;

            if (is_array($value)) {
                $results = array_merge($results, $this->flattenToDotNotation($value, $currentKey.'.'));
            } else {
                // Skip numeric keys at the top level (they're likely array values, not config keys)
                if ($prefix === '' && is_numeric($key)) {
                    continue;
                }
                $results[] = $currentKey;
            }
        }

        return $results;
    }
}
