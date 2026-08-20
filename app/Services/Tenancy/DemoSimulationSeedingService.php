<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use Database\Seeders\DemoSimulationSeeder;
use Illuminate\Support\Facades\Artisan;

class DemoSimulationSeedingService
{
    public function shouldSeedFor(Tenant $tenant): bool
    {
        return $tenant->slug === 'demo';
    }

    public function seed(): void
    {
        Artisan::call('db:seed', [
            '--class' => DemoSimulationSeeder::class,
            '--force' => true,
            '--database' => config('tenancy.tenant_connection', 'tenant'),
        ]);
    }
}
