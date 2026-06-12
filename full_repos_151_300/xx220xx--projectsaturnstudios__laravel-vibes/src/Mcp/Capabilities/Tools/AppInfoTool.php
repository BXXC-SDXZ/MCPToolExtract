<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Tools;

use stdClass;
use Laravel\Roster\Package;
use Laravel\Roster\Roster;
use Superconductor\Capabilities\Tools\Mcp\Capabilities\Tools\Tool;
use Superconductor\Capabilities\Tools\Support\Attributes\ToolCall;
use Superconductor\LaravelVibes\Support\Boost\GuidelineAssist;

#[ToolCall(
    tool: 'application-info',
    description: 'Get comprehensive application information including PHP version, Laravel version, database engine, all installed packages with their versions, and all Eloquent models in the application. You should use this tool on each new chat, and use the package & version data to write version specific code for the packages that exist.',
    input_schema: [
        'type'   => 'object',
        'properties' => new stdClass(),
        'required' => []
    ]
)]
class AppInfoTool extends Tool
{
    public function handle(): array
    {
        $guidelineAssist = app(GuidelineAssist::class);
        $roster = app(Roster::class);

        return [[
            'type' => 'text',
            'text' => json_encode([
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'database_engine' => config('database.default'),
                'packages' => $roster->packages()->map(fn (Package $package) => ['roster_name' => $package->name(), 'version' => $package->version(), 'package_name' => $package->rawName()]),
                'models' => array_keys($guidelineAssist->models()),
            ])
        ]];
    }
}
