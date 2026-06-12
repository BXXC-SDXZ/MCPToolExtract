<?php

namespace Superconductor\LaravelVibes\Mcp\Capabilities\Prompts;

use Superconductor\Capabilities\Prompts\Mcp\Capabilities\Prompts\Prompt;
use Superconductor\Capabilities\Prompts\Support\Attributes\PresetPrompt;

#[PresetPrompt(
    name: 'read-logs',
    description: 'Asks the model to get the last n logs.',
    arguments: [
        [
            'name' => 'count',
            'description' => 'The number of log entries to retrieve.',
            'required' => true,
        ]
    ]
)]
class ReadLogPrompt extends Prompt
{
    public function handle(int $count): array
    {
        return [
            "description" => "Retrieving the last {$count} entries from the system logs.",
            "messages" => [
                [
                    "role" => "user",
                    "content" => [
                        'type' => 'text',
                        'text' => "Please provide the last {$count} log entries from the system logs using the read-log-entries tool."
                    ]
                ]
            ]
        ];
    }
}
