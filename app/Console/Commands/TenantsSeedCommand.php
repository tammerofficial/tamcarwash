<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class TenantsSeedCommand extends Command
{
    protected $signature = 'tenants:seed
                            {--tenant= : Specific tenant slug or ID}
                            {--class= : Seeder class to run}
                            {--force : Force seed in production}';

    protected $description = 'Run seeders for one or all tenant databases';

    public function handle(TenantConnectionManager $connectionManager): int
    {
        $seederClass = $this->option('class');

        if (! $seederClass) {
            $this->error('Seeder class required via --class. Agent 4 will provide tenant seeders.');

            return self::FAILURE;
        }

        $tenants = $this->resolveTenants();

        foreach ($tenants as $tenant) {
            $this->info("Seeding tenant: {$tenant->name} ({$tenant->slug})");

            try {
                $connectionManager->connect($tenant);

                Artisan::call('db:seed', [
                    '--class' => $seederClass,
                    '--force' => $this->option('force') || true,
                ]);

                $this->line(Artisan::output());
            } catch (\Throwable $e) {
                $this->error("  Failed: {$e->getMessage()}");
            } finally {
                $connectionManager->useLandlord();
            }
        }

        return self::SUCCESS;
    }

    protected function resolveTenants()
    {
        $query = Tenant::query()->where('status', 'active');

        if ($tenantRef = $this->option('tenant')) {
            $query->where(function ($q) use ($tenantRef) {
                $q->where('slug', $tenantRef)->orWhere('id', $tenantRef);
            });
        }

        return $query->with('database')->get()->filter(fn ($t) => $t->database !== null);
    }
}
