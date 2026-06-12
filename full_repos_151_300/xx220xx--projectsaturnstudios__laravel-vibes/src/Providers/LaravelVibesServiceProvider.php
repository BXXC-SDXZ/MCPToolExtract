<?php

namespace Superconductor\LaravelVibes\Providers;

use ProjectSaturnStudios\LaravelDesignPatterns\Providers\BaseServiceProvider;

class LaravelVibesServiceProvider extends BaseServiceProvider
{
    protected array $config = [
        //'superconductor.capabilities.tools' => __DIR__ .'/../../config/tools.php',
    ];

    protected array $publishable_config = [
        //['key' => 'superconductor.capabilities.tools', 'file_path' => 'superconductor.php', 'groups' => ['superconductor', 'superconductor.capabilities', 'superconductor.capabilities.tools']],
    ];

    protected array $commands = [];

    protected array $bootables = [];

    protected array $routes = [
        __DIR__.'/../../routes/tools.php',
        __DIR__.'/../../routes/resources.php',
        __DIR__.'/../../routes/prompts.php',
        __DIR__.'/../../routes/servers.php',
    ];

    /**
     * @return void
     */
    protected function mainBooted(): void
    {
        $this->loadViewsFrom(__DIR__.'/../../resources/views/ai-docs', 'vibe-docs');
    }
}
