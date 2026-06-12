<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Resources;

use Superconductor\Capabilities\Resources\Mcp\Capabilities\Resources\ResourceViewResource;
use Superconductor\Capabilities\Resources\Support\Attributes\ReadableResource;

#[ReadableResource(
    uri: 'view:///ai-docs/boost/core.blade.php',
    name: 'laravel-boost-rules.md',
    description: 'Rules for Laravel Boost',
    mimeType: 'text/plain',
)]
class BoostRulesResource extends ResourceViewResource {
    protected string $view = 'vibe-docs::boost.core';
}
