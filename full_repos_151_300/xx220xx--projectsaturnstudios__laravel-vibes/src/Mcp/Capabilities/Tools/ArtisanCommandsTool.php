<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use stdClass;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;


#[ToolCall(
    tool: 'list-artisan-commands',
    description: 'List all available Artisan commands registered in this application.',
    input_schema: [
        'type'   => 'object',
        'properties' => new stdClass(),
        'required' => []
    ]
)]
class ArtisanCommandsTool extends Tool
{
    public function handle(): array
    {
        $commands = Artisan::all();

        $commandList = [];
        foreach ($commands as $name => $command) {
            /** @var Command $command */
            $commandList[] = [
                'name' => $name,
                'description' => $command->getDescription(),
            ];
        }

        // Sort alphabetically by name for determinism.
        usort($commandList, fn ($firstCommand, $secondCommand) => strcmp($firstCommand['name'], $secondCommand['name']));

        return [
            [
                'type' => 'text',
                'text' => json_encode($commandList, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            ]
        ];
    }
}
