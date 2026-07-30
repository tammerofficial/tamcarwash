<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use Database\Seeders\DemoTenantUsersSeeder;
use Illuminate\Support\Facades\Artisan;

class DemoUserSeedingService
{
    /**
     * Demo quick-login users (owner@demo.test, etc.) are always seeded for the
     * dedicated demo tenant. In local dev they are also seeded for every tenant
     * so quick-login buttons work on any subdirectory URL.
     */
    public function shouldSeedFor(Tenant $tenant): bool
    {
        if ($tenant->slug === 'demo') {
            return true;
        }

        return (bool) config('tenancy.seed_demo_users', false);
    }

    public function seed(): void
    {
        Artisan::call('db:seed', [
            '--class' => DemoTenantUsersSeeder::class,
            '--force' => true,
            '--database' => config('tenancy.tenant_connection', 'tenant'),
        ]);
    }
}
