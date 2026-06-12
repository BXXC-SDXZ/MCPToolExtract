<?php

declare(strict_types=1);

namespace Superconductor\LaravelVibes\Support\Boost\DatabaseSchema;

use Illuminate\Support\Facades\DB;

class SchemaDriverFactory
{
    public static function make(?string $connection = null): DatabaseSchemaDriver
    {
        $driverName = DB::connection($connection)->getDriverName();

        return match ($driverName) {
            'mysql', 'mariadb' => new MySQLSchemaDriver($connection),
            'pgsql' => new PostgreSQLSchemaDriver($connection),
            'sqlite' => new SQLiteSchemaDriver($connection),
            default => new NullSchemaDriver($connection),
        };
    }
}
