<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

class TenantMigrationRunner
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function run(Tenant $tenant, bool $fresh = false): int
    {
        $this->connectionManager->connect($tenant);

        $path = config('tenancy.tenant_migrations_path');

        if ($fresh) {
            Artisan::call('migrate:fresh', [
                '--database' => config('tenancy.tenant_connection', 'tenant'),
                '--path' => $this->relativeMigrationPath($path),
                '--force' => true,
            ]);
        } else {
            Artisan::call('migrate', [
                '--database' => config('tenancy.tenant_connection', 'tenant'),
                '--path' => $this->relativeMigrationPath($path),
                '--force' => true,
            ]);
        }

        $batch = (int) DB::connection(config('tenancy.tenant_connection', 'tenant'))
            ->table('migrations')
            ->max('batch');

        $this->connectionManager->useLandlord();

        return $batch ?: 1;
    }

    public function rollback(Tenant $tenant, int $steps = 1): void
    {
        $this->connectionManager->connect($tenant);

        Artisan::call('migrate:rollback', [
            '--database' => config('tenancy.tenant_connection', 'tenant'),
            '--path' => $this->relativeMigrationPath(config('tenancy.tenant_migrations_path')),
            '--step' => $steps,
            '--force' => true,
        ]);

        $this->connectionManager->useLandlord();
    }

    public function status(Tenant $tenant): string
    {
        $this->connectionManager->connect($tenant);

        Artisan::call('migrate:status', [
            '--database' => config('tenancy.tenant_connection', 'tenant'),
            '--path' => $this->relativeMigrationPath(config('tenancy.tenant_migrations_path')),
        ]);

        $output = Artisan::output();

        $this->connectionManager->useLandlord();

        return $output;
    }

    protected function relativeMigrationPath(string $absolutePath): string
    {
        $base = base_path();

        if (str_starts_with($absolutePath, $base)) {
            return ltrim(str_replace($base, '', $absolutePath), '/\\');
        }

        return 'database/migrations/tenant';
    }
}
