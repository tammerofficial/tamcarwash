<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use App\Models\Landlord\TenantDatabase;
use App\Models\Landlord\TenantDomain;
use App\Models\Landlord\TenantProvisioningLog;
use App\Models\TenantUser;
use Database\Seeders\DemoTenantUsersSeeder;
use Database\Seeders\TenantProductionSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Throwable;

class TenantProvisioningService
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
        protected TenantMigrationRunner $migrationRunner,
    ) {}

    /**
     * Idempotent 8-step tenant provisioning flow.
     *
     * @return array<string, mixed>
     */
    public function provision(Tenant $tenant, array $options = []): array
    {
        $results = [];

        foreach (config('tenancy.provisioning.steps') as $step) {
            $results[$step] = $this->runStep($tenant, $step, $options);
        }

        return $results;
    }

    protected function runStep(Tenant $tenant, string $step, array $options): array
    {
        $existing = TenantProvisioningLog::query()
            ->where('tenant_id', $tenant->id)
            ->where('step', $step)
            ->where('status', 'completed')
            ->first();

        if ($existing && ! ($options['force'] ?? false)) {
            return [
                'step' => $step,
                'status' => 'skipped',
                'message' => 'Already completed',
            ];
        }

        $log = TenantProvisioningLog::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'step' => $step],
            [
                'status' => 'running',
                'started_at' => now(),
                'completed_at' => null,
                'message' => null,
            ]
        );

        $started = microtime(true);

        try {
            $message = match ($step) {
                'validate_tenant' => $this->stepValidateTenant($tenant),
                'create_database' => $this->stepCreateDatabase($tenant),
                'register_database' => $this->stepRegisterDatabase($tenant),
                'run_migrations' => $this->stepRunMigrations($tenant),
                'seed_tenant' => $this->stepSeedTenant($tenant, $options),
                'configure_domains' => $this->stepConfigureDomains($tenant),
                'activate_tenant' => $this->stepActivateTenant($tenant),
                'finalize' => $this->stepFinalize($tenant),
                default => throw new \InvalidArgumentException("Unknown provisioning step: {$step}"),
            };

            $durationMs = (int) ((microtime(true) - $started) * 1000);

            $log->update([
                'status' => 'completed',
                'message' => $message,
                'duration_ms' => $durationMs,
                'completed_at' => now(),
            ]);

            return [
                'step' => $step,
                'status' => 'completed',
                'message' => $message,
                'duration_ms' => $durationMs,
            ];
        } catch (Throwable $e) {
            $durationMs = (int) ((microtime(true) - $started) * 1000);

            $log->update([
                'status' => 'failed',
                'message' => $e->getMessage(),
                'context' => ['exception' => get_class($e)],
                'duration_ms' => $durationMs,
                'completed_at' => now(),
            ]);

            throw $e;
        }
    }

    protected function stepValidateTenant(Tenant $tenant): string
    {
        if (blank($tenant->slug) || blank($tenant->name)) {
            throw new \RuntimeException('Tenant slug and name are required.');
        }

        if (! in_array($tenant->status, ['pending', 'provisioning', 'active'], true)) {
            $tenant->update(['status' => 'provisioning']);
        }

        return 'Tenant validated';
    }

    protected function stepCreateDatabase(Tenant $tenant): string
    {
        $databaseName = $this->databaseNameFor($tenant);

        if ($this->tenantUsesSqlite()) {
            $path = $this->sqlitePathFor($tenant);
            $directory = dirname($path);

            if (! is_dir($directory)) {
                mkdir($directory, 0755, true);
            }

            if (! file_exists($path)) {
                touch($path);
            }

            return "SQLite database [{$path}] ready";
        }

        $exists = DB::connection('landlord')->select(
            'SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?',
            [$databaseName]
        );

        if (empty($exists)) {
            DB::connection('landlord')->statement(
                "CREATE DATABASE `{$databaseName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            );
        }

        return "Database [{$databaseName}] ready";
    }

    protected function stepRegisterDatabase(Tenant $tenant): string
    {
        $databaseName = $this->databaseNameFor($tenant);

        $attributes = [
            'database_name' => $databaseName,
            'connection_name' => config('tenancy.tenant_connection', 'tenant'),
            'status' => 'provisioned',
            'provisioned_at' => now(),
        ];

        if ($this->tenantUsesSqlite()) {
            $attributes['host'] = null;
            $attributes['port'] = null;
            $attributes['username'] = null;
            $attributes['password'] = null;
        } else {
            $attributes['host'] = config('database.connections.tenant.host');
            $attributes['port'] = (int) config('database.connections.tenant.port');
            $attributes['username'] = config('database.connections.tenant.username');
            $attributes['password'] = config('database.connections.tenant.password');
        }

        TenantDatabase::query()->updateOrCreate(
            ['tenant_id' => $tenant->id],
            $attributes
        );

        return "Database record registered for [{$databaseName}]";
    }

    protected function stepRunMigrations(Tenant $tenant): string
    {
        $batch = $this->migrationRunner->run($tenant);

        $tenant->database?->update(['migration_batch' => $batch, 'status' => 'ready']);

        return "Migrations completed (batch {$batch})";
    }

    protected function stepSeedTenant(Tenant $tenant, array $options): string
    {
        if ($options['skip_seed'] ?? false) {
            return 'Seeding skipped by option';
        }

        $seederClass = $options['seeder'] ?? TenantProductionSeeder::class;

        $this->connectionManager->connect($tenant);

        Artisan::call('db:seed', [
            '--class' => $seederClass,
            '--force' => true,
            '--database' => config('tenancy.tenant_connection', 'tenant'),
        ]);

        $ownerEmail = $options['owner_email'] ?? $tenant->email ?? "owner@{$tenant->slug}.test";
        $ownerPassword = $options['owner_password'] ?? Str::random(16);
        $ownerName = $options['owner_name'] ?? $tenant->name.' — المالك';

        $owner = TenantUser::query()->updateOrCreate(
            ['email' => $ownerEmail],
            [
                'name' => $ownerName,
                'password' => $ownerPassword,
                'email_verified_at' => now(),
            ]
        );

        $ownerRole = Role::query()->where('name', 'owner')->where('guard_name', 'tenant')->first();
        if ($ownerRole && ! $owner->hasRole('owner')) {
            $owner->assignRole($ownerRole);
        }

        if ($tenant->slug === 'demo') {
            Artisan::call('db:seed', [
                '--class' => DemoTenantUsersSeeder::class,
                '--force' => true,
                '--database' => config('tenancy.tenant_connection', 'tenant'),
            ]);
        }

        $this->connectionManager->useLandlord();

        return "Seeder [{$seederClass}] executed; owner [{$ownerEmail}] ready";
    }

    protected function stepConfigureDomains(Tenant $tenant): string
    {
        $platformDomain = config('tenancy.platform_domain');
        $subdomain = "{$tenant->slug}.{$platformDomain}";

        TenantDomain::query()->updateOrCreate(
            ['tenant_id' => $tenant->id, 'domain' => $subdomain],
            [
                'type' => 'subdomain',
                'is_primary' => true,
                'is_verified' => true,
                'verified_at' => now(),
                'ssl_status' => 'pending',
            ]
        );

        return "Primary domain configured: {$subdomain}";
    }

    protected function stepActivateTenant(Tenant $tenant): string
    {
        $tenant->update([
            'status' => 'active',
            'activated_at' => $tenant->activated_at ?? now(),
        ]);

        return 'Tenant activated';
    }

    protected function stepFinalize(Tenant $tenant): string
    {
        $this->connectionManager->forgetCache($tenant);

        return 'Provisioning finalized';
    }

    protected function databaseNameFor(Tenant $tenant): string
    {
        if ($this->tenantUsesSqlite()) {
            return 'tenants/'.$tenant->slug.'.sqlite';
        }

        $prefix = config('tenancy.tenant_database_prefix', 'tamcarwash_tenant_');

        return $prefix.Str::slug($tenant->slug, '_');
    }

    protected function tenantUsesSqlite(): bool
    {
        return config('tenancy.database.tenant_driver', 'mysql') === 'sqlite';
    }

    protected function sqlitePathFor(Tenant $tenant): string
    {
        $directory = config('tenancy.database.tenant_sqlite_directory') ?: database_path('tenants');

        return rtrim($directory, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$tenant->slug.'.sqlite';
    }

}
