<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Throwable;
use Laravel\Roster\Roster;
use Laravel\Roster\Package;
use Superconductor\LaravelVibes\Concerns\Boost\MakesHttpRequests;

#[ToolCall(
    tool: 'search-docs',
    description: 'Search for up-to-date version-specific documentation related to this project and its packages. This tool will search Laravel hosted documentation based on the packages installed and is perfect for all Laravel ecosystem packages. Laravel, Inertia, Pest, Livewire, Filament, Nova, Tailwind, and more.'.PHP_EOL.'You must use this tool to search for Laravel-ecosystem docs before using other approaches. The results provided are for this project\'s package version and does not cover all versions of the package.',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'queries' => [
                'type' => 'array',
                'description' => 'List of queries to perform, pass multiple if you aren\'t sure if it is "toggle" or "switch", for example',
                'items' => [
                    'type' => 'string',
                    'description' => 'Search query',
                ],
            ],
            'packages' => [
                'type' => 'array',
                'description' => 'Package names to limit searching to from application-info. Useful if you know the package(s) you need. i.e. laravel/framework, inertiajs/inertia-laravel, @inertiajs/react',
                'items' => [
                    'type' => 'string',
                    'description' => "The composer package name (e.g., 'symfony/console')",
                ],
            ],
            'token_limit' => [
                'type' => 'integer',
                'description' => 'Maximum number of tokens to return in the response. Defaults to 10,000 tokens, maximum 1,000,000 tokens.',
            ],
        ],
        'required' => ['queries']
    ]
)]
class SearchDocsTool extends Tool
{
    use MakesHttpRequests;

    public function handle(array $queries, ?array $packages = null, ?int $token_limit = 10000): array
    {
        $roster = app(Roster::class);
        $apiUrl = config('vibes.hosted.api_url', 'https://boost.laravel.com').'/api/docs';
        $packagesFilter = $packages;

        $queries = array_filter(
            array_map('trim', $queries),
            fn ($query) => $query !== '' && $query !== '*'
        );

        try {
            $packagesCollection = $roster->packages();

            // Only search in specific packages
            if ($packagesFilter) {
                $packagesCollection = $packagesCollection->filter(fn (Package $package) => in_array($package->rawName(), $packagesFilter));
            }

            $packages = $packagesCollection->map(function (Package $package) {
                $name = $package->rawName();
                $version = $package->majorVersion().'.x';

                return [
                    'name' => $name,
                    'version' => $version,
                ];
            });

            $packages = $packages->values()->toArray();
        } catch (Throwable $e) {
            return [[
                'type' => 'text',
                'text' => 'Failed to get packages: '.$e->getMessage()
            ]];
        }

        $tokenLimit = $arguments['token_limit'] ?? 10000;
        $tokenLimit = min($tokenLimit, 1000000); // Cap at 1M tokens

        $payload = [
            'queries' => $queries,
            'packages' => $packages,
            'token_limit' => $tokenLimit,
            'format' => 'markdown',
        ];

        try {
            $response = $this->client()->asJson()->post($apiUrl, $payload);

            if (! $response->successful()) {
                return [[
                    'type' => 'text',
                    'text' => 'Failed to search documentation: '.$response->body()
                ]];
            }
        } catch (\Throwable $e) {
            return [[
                'type' => 'text',
                'text' => 'HTTP request failed: '.$e->getMessage()
            ]];
        }

        return [
            [
                'type' => 'text',
                'text' => $response->body(),
            ]
        ];
    }


}
