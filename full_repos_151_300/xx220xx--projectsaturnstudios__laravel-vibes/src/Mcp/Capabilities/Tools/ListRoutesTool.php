<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use Illuminate\Support\Facades\Artisan;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Symfony\Component\Console\Output\BufferedOutput;
use Symfony\Component\Console\Command\Command as CommandAlias;

#[ToolCall(
    tool: 'list-routes',
    description: 'List all available routes defined in the application, including Folio routes if used',
    input_schema: [
        'type'   => 'object',
        'properties' => [
            'method' => [
                'type'        => 'string',
                'description' => 'Filter the routes by HTTP method.'
            ],
            'action' => [
                'type'        => 'string',
                'description' => 'Filter the routes by action.'
            ],
            'name' => [
                'type'        => 'string',
                'description' => 'Filter the routes by name.'
            ],
            'domain' => [
                'type'        => 'string',
                'description' => 'Filter the routes by domain.'
            ],
            'path' => [
                'type'        => 'string',
                'description' => 'Only show routes matching the given path pattern.'
            ],
            'except_path' => [
                'type'        => 'string',
                'description' => 'Do not display the routes matching the given path pattern.'
            ],
            'except_vendor' => [
                'type'        => 'boolean',
                'description' => 'Do not display routes defined by vendor packages.'
            ],
            'only_vendor' => [
                'type'        => 'boolean',
                'description' => 'Only display routes defined by vendor packages.'
            ],
        ],
        'required' => []
    ]
)]
class ListRoutesTool extends Tool
{
    public function handle(
        ?string $method = null,
        ?string $action = null,
        ?string $name = null,
        ?string $domain = null,
        ?string $path = null,
        ?string $except_path = null,
        ?bool $except_vendor = null,
        ?bool $only_vendor = null
    ): array
    {
        $arguments = [
            'method' => $method,
            'action' => $action,
            'name' => $name,
            'domain' => $domain,
            'path' => $path,
            'except_path' => $except_path, // Convert underscore to hyphen in the CLI
            'except_vendor' => !empty($except_vendor)? $except_vendor : false,
            'only_vendor' => !empty($only_vendor) ? $only_vendor: false,
        ];
        $optionMap = [
            'method' => 'method',
            'action' => 'action',
            'name' => 'name',
            'domain' => 'domain',
            'path' => 'path',
            'except_path' => 'except-path', // Convert underscore back to hyphen
            'except_vendor' => 'except-vendor',
            'only_vendor' => 'only-vendor',
        ];

        $options = [
            '--no-ansi' => true,
            '--no-interaction' => true,
        ];

        foreach ($optionMap as $argKey => $cliOption) {
            if (array_key_exists($argKey, $arguments) && ! empty($arguments[$argKey]) && $arguments[$argKey] !== '*') {
                $options['--'.$cliOption] = $arguments[$argKey];
            }
        }

        $routesOutput = $this->artisan('route:list', $options);

        // If Folio is installed, include folio routes (JSON to prevent hanging)
        if (class_exists('Laravel\\Folio\\FolioRoutes')) {
            $routesOutput .= "\n\n=== FOLIO ROUTES (JSON) ===\n\n";

            $folioOptions = $options;
            $folioOptions['--json'] = true; // Ensure non-interactive json output

            $routesOutput .= $this->artisan('folio:list', $folioOptions);
        }

        return [
            [
                'type' => 'text',
                'text' => $routesOutput
            ]
        ];
    }

    /**
     * @param array<string|bool> $options
     */
    private function artisan(string $command, array $options = []): string
    {
        $output = new BufferedOutput;
        $result = Artisan::call($command, $options, $output);
        if ($result !== CommandAlias::SUCCESS) {
            return 'Failed to list routes: '.$output->fetch();
        }

        return trim($output->fetch());
    }
}
