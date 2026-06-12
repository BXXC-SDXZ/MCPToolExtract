<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;


use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Symfony\Component\Routing\Exception\RouteNotFoundException;

#[ToolCall(
    tool: 'get-absolute-url',
    description: 'Get the absolute URL for a given relative path or named route. If no arguments are provided, you will get the absolute URL for "/"',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'path' => [
                'type'        => 'string',
                'description' => 'The relative URL/path (e.g. "/dashboard") to convert to an absolute URL.'
            ],
            'route' => [
                'type'        => 'string',
                'description' => 'The named route to generate an absolute URL for (e.g. "home").'
            ],
        ],
        'required' => []
    ]
)]
class AbsoluteUrlTool extends Tool
{
    public function handle(?string $path = null, ?string $route = null): array
    {
        $routeName = $route;

        try {
            if ($path) {
                return [[
                    'type' => 'text',
                    'text' => url($path),
                ]];
            }

            if ($routeName) {
                return [
                    [
                        'type' => 'text',
                        'text' => route($routeName),
                    ]
                ];
            }

            return [
                [
                    'type' => 'text',
                    'text' => url('/'),
                ]
            ];
        }
        catch (RouteNotFoundException $e) {
            return [
                [
                    'type' => 'text',
                    'text' => "Route $route does not exist",
                ]
            ];
        }

    }
}
