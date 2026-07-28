<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use App\Models\Landlord\TenantDatabase;
use App\Models\Landlord\TenantDomain;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TenantConnectionManager
{
    public function __construct(
        protected TenantContext $context,
    ) {}

    public function connect(Tenant $tenant, bool $force = false): void
    {
        if (! $force && $this->context->isInitialized() && $this->context->id() === $tenant->id) {
            return;
        }

        $tenant->loadMissing('database');

        if (! $tenant->database) {
            throw new RuntimeException("Tenant [{$tenant->slug}] has no database record.");
        }

        $this->configureConnection($tenant->database);
        $this->purgeAndReconnect();

        $this->context->set($tenant);
        $this->cacheTenantConnection($tenant);
    }

    public function connectBySlug(string $slug): Tenant
    {
        $tenant = $this->resolveTenantBySlug($slug);

        $this->connect($tenant);

        return $tenant;
    }

    public function connectByDomain(string $domain): Tenant
    {
        $tenant = $this->resolveTenantByDomain($domain);

        $this->connect($tenant);

        return $tenant;
    }

    public function disconnect(): void
    {
        $this->purgeAndReconnect();
        $this->context->forget();
    }

    public function useLandlord(): void
    {
        Config::set('database.default', config('tenancy.landlord_connection'));
        $this->context->forget();
    }

    protected function configureConnection(TenantDatabase $database): void
    {
        $connectionName = config('tenancy.tenant_connection', 'tenant');
        $driver = config('tenancy.database.tenant_driver', 'mysql');

        if ($driver === 'sqlite') {
            $path = $this->resolveSqliteDatabasePath($database->database_name);

            Config::set("database.connections.{$connectionName}", [
                'driver' => 'sqlite',
                'database' => $path,
                'prefix' => '',
                'foreign_key_constraints' => config('database.connections.sqlite.foreign_key_constraints', true),
                'busy_timeout' => null,
                'journal_mode' => null,
                'synchronous' => null,
                'transaction_mode' => 'DEFERRED',
            ]);
        } else {
            Config::set("database.connections.{$connectionName}", array_merge(
                config("database.connections.{$connectionName}", []),
                array_filter([
                    'driver' => 'mysql',
                    'host' => $database->host ?: config('database.connections.tenant.host'),
                    'port' => $database->port ?: config('database.connections.tenant.port'),
                    'database' => $database->database_name,
                    'username' => $database->username ?: config('database.connections.tenant.username'),
                    'password' => $database->password ?: config('database.connections.tenant.password'),
                    'charset' => config('database.connections.tenant.charset', 'utf8mb4'),
                    'collation' => config('database.connections.tenant.collation', 'utf8mb4_unicode_ci'),
                    'prefix' => '',
                    'prefix_indexes' => true,
                    'strict' => true,
                ])
            ));
        }

        Config::set('database.default', $connectionName);
    }

    protected function resolveSqliteDatabasePath(string $databaseName): string
    {
        if ($databaseName !== '' && str_starts_with($databaseName, DIRECTORY_SEPARATOR)) {
            return $databaseName;
        }

        if ($databaseName !== '' && (str_contains($databaseName, '.sqlite') || str_contains($databaseName, '/'))) {
            return database_path($databaseName);
        }

        $directory = config('tenancy.database.tenant_sqlite_directory') ?: database_path('tenants');

        return rtrim($directory, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$databaseName;
    }

    protected function purgeAndReconnect(): void
    {
        $landlord = config('tenancy.landlord_connection', 'landlord');
        $tenant = config('tenancy.tenant_connection', 'tenant');

        DB::purge($landlord);
        DB::purge($tenant);
        DB::reconnect(config('database.default'));
    }

    protected function resolveTenantBySlug(string $slug): Tenant
    {
        return Cache::remember(
            $this->cacheKey("slug:{$slug}"),
            config('tenancy.cache.ttl'),
            fn () => Tenant::query()
                ->with('database')
                ->where('slug', $slug)
                ->whereIn('status', ['active', 'provisioning'])
                ->firstOrFail()
        );
    }

    protected function resolveTenantByDomain(string $domain): Tenant
    {
        return Cache::remember(
            $this->cacheKey("domain:{$domain}"),
            config('tenancy.cache.ttl'),
            function () use ($domain) {
                $tenantDomain = TenantDomain::query()
                    ->where('domain', $domain)
                    ->where('is_verified', true)
                    ->with('tenant.database')
                    ->firstOrFail();

                return $tenantDomain->tenant;
            }
        );
    }

    protected function cacheTenantConnection(Tenant $tenant): void
    {
        Cache::put(
            $this->cacheKey("active:{$tenant->id}"),
            $tenant->only(['id', 'slug', 'name', 'status']),
            config('tenancy.cache.ttl')
        );
    }

    public function forgetCache(?Tenant $tenant = null): void
    {
        $tenant ??= $this->context->get();

        if (! $tenant) {
            return;
        }

        Cache::forget($this->cacheKey("slug:{$tenant->slug}"));
        Cache::forget($this->cacheKey("active:{$tenant->id}"));

        $tenant->loadMissing('domains');

        foreach ($tenant->domains as $domain) {
            Cache::forget($this->cacheKey("domain:{$domain->domain}"));
        }
    }

    protected function cacheKey(string $suffix): string
    {
        return config('tenancy.cache.prefix').$suffix;
    }
}
