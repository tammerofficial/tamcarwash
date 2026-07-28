<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;

class TenantsRunScheduledCommand extends Command
{
    protected $signature = 'tenants:run-scheduled
                            {--tenant= : Specific tenant slug or ID}';

    protected $description = 'Run scheduled tasks in tenant context';

    public function handle(TenantConnectionManager $connectionManager): int
    {
        $tenants = Tenant::query()
            ->where('status', 'active')
            ->when($this->option('tenant'), function ($q, $ref) {
                $q->where(function ($inner) use ($ref) {
                    $inner->where('slug', $ref)->orWhere('id', $ref);
                });
            })
            ->with('database')
            ->get()
            ->filter(fn ($t) => $t->database !== null);

        foreach ($tenants as $tenant) {
            $this->info("Running schedule for: {$tenant->name}");

            try {
                $connectionManager->connect($tenant);

                Artisan::call('schedule:run');

                $this->line(Artisan::output());
            } catch (\Throwable $e) {
                $this->error("  Failed: {$e->getMessage()}");
            } finally {
                $connectionManager->useLandlord();
            }
        }

        return self::SUCCESS;
    }
}
