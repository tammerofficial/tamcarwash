<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\DemoUserSeedingService;
use App\Services\Tenancy\DemoSimulationSeedingService;
use App\Services\Tenancy\WashDemoScenarioService;
use Database\Seeders\TenantProductionSeeder;
use Database\Seeders\WashDemoLandlordSeeder;
use Database\Seeders\WashDemoTenantSeeder;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class SeedProductionCommand extends Command
{
    protected $signature = 'app:seed-production
                            {--tenants : Seed all active tenant databases}
                            {--tenant= : Seed a specific tenant slug or UUID}
                            {--force : Accepted for deploy-script compatibility (seeding is already non-destructive)}';

    protected $description = 'Run idempotent production seeders for landlord, demo tenants, and tenant databases (never truncates)';

    public function handle(
        TenantConnectionManager $tenantManager,
        DemoUserSeedingService $demoUserSeeding,
        DemoSimulationSeedingService $demoSimulationSeeding,
    ): int {
        $this->info('Starting production seed (safe rerun, no truncate)...');
        Log::info('[app:seed-production] started', [
            'tenants' => (bool) $this->option('tenants'),
            'tenant' => $this->option('tenant'),
        ]);

        $this->seedLandlord($tenantManager);

        if ($this->option('tenants') || $this->option('tenant')) {
            $this->line('Running tenant migrations...');
            $this->callSilent('tenants:migrate');
        }

        $this->seedTenants($tenantManager, $demoUserSeeding, $demoSimulationSeeding);

        $this->info('Production seed completed.');
        Log::info('[app:seed-production] completed');

        return self::SUCCESS;
    }

    protected function seedLandlord(TenantConnectionManager $tenantManager): void
    {
        $this->line('Seeding landlord database...');
        $tenantManager->useLandlord();

        $this->callSilent('db:seed', [
            '--class' => WashDemoLandlordSeeder::class,
            '--force' => true,
            '--database' => config('tenancy.landlord_connection', 'landlord'),
        ]);

        $this->info('Landlord seed finished.');
    }

    protected function seedTenants(
        TenantConnectionManager $tenantManager,
        DemoUserSeedingService $demoUserSeeding,
        DemoSimulationSeedingService $demoSimulationSeeding,
    ): void {
        if (! $this->option('tenants') && ! $this->option('tenant')) {
            $this->comment('Skipping tenants. Use --tenants or --tenant=slug to seed tenant databases.');

            return;
        }

        $tenantManager->useLandlord();

        if (! Schema::connection('landlord')->hasTable('tenants')) {
            $this->warn('Landlord tenants table not available. Skipping tenant seeding.');

            return;
        }

        $query = Tenant::query()->where('status', 'active')->with('database');

        if ($identifier = $this->option('tenant')) {
            $query->where(function ($q) use ($identifier) {
                $q->where('slug', $identifier)->orWhere('id', $identifier);
            });
        }

        $tenants = $query->orderBy('created_at')->get();

        if ($tenants->isEmpty()) {
            $this->warn('No matching active tenants found.');

            return;
        }

        foreach ($tenants as $tenant) {
            if (! $tenant->database?->isReady()) {
                $this->warn("Skipping tenant {$tenant->slug}: database not ready.");
                Log::warning('[app:seed-production] tenant skipped', ['tenant_id' => $tenant->id, 'reason' => 'database_not_ready']);

                continue;
            }

            $this->line("Seeding tenant: {$tenant->name} ({$tenant->slug})");

            try {
                $tenantManager->connect($tenant);
                $this->callSilent('db:seed', [
                    '--class' => TenantProductionSeeder::class,
                    '--force' => true,
                    '--database' => config('tenancy.tenant_connection', 'tenant'),
                ]);

                if (in_array($tenant->slug, WashDemoScenarioService::ALWADI_SLUGS, true)) {
                    $this->callSilent('db:seed', [
                        '--class' => WashDemoTenantSeeder::class,
                        '--force' => true,
                        '--database' => config('tenancy.tenant_connection', 'tenant'),
                    ]);
                }

                if ($demoUserSeeding->shouldSeedFor($tenant)) {
                    $demoUserSeeding->seed();
                }

                if ($demoSimulationSeeding->shouldSeedFor($tenant)) {
                    $demoSimulationSeeding->seed();
                }

                Log::info('[app:seed-production] tenant seeded', ['tenant_id' => $tenant->id, 'slug' => $tenant->slug]);
                $this->info("Tenant {$tenant->slug} seed finished.");
            } catch (\Throwable $e) {
                $this->error("Tenant {$tenant->slug} failed: {$e->getMessage()}");
                Log::error('[app:seed-production] tenant failed', ['tenant_id' => $tenant->id, 'error' => $e->getMessage()]);
            } finally {
                $tenantManager->disconnect();
                $tenantManager->useLandlord();
            }
        }
    }
}
