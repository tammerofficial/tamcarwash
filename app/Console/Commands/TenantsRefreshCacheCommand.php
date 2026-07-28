<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use Illuminate\Console\Command;

class TenantsRefreshCacheCommand extends Command
{
    protected $signature = 'tenants:refresh-cache
                            {--tenant= : Specific tenant slug or ID}';

    protected $description = 'Clear and rebuild tenant resolution cache';

    public function handle(TenantConnectionManager $connectionManager): int
    {
        $query = Tenant::query();

        if ($tenantRef = $this->option('tenant')) {
            $query->where(function ($q) use ($tenantRef) {
                $q->where('slug', $tenantRef)->orWhere('id', $tenantRef);
            });
        }

        $tenants = $query->with('domains')->get();

        foreach ($tenants as $tenant) {
            $connectionManager->forgetCache($tenant);
            $this->line("Cleared cache for: {$tenant->slug}");
        }

        $this->info("Refreshed cache for {$tenants->count()} tenant(s).");

        return self::SUCCESS;
    }
}
