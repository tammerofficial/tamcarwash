<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantMigrationRunner;
use Illuminate\Console\Command;

class TenantsMigrateCommand extends Command
{
    protected $signature = 'tenants:migrate
                            {--tenant= : Specific tenant slug or ID}
                            {--fresh : Drop all tables and re-run migrations}
                            {--status : Show migration status only}';

    protected $description = 'Run migrations for one or all tenant databases';

    public function handle(TenantMigrationRunner $migrationRunner): int
    {
        $tenants = $this->resolveTenants();

        if ($tenants->isEmpty()) {
            $this->warn('No tenants found.');

            return self::SUCCESS;
        }

        foreach ($tenants as $tenant) {
            $this->info("Migrating tenant: {$tenant->name} ({$tenant->slug})");

            try {
                if ($this->option('status')) {
                    $this->line($migrationRunner->status($tenant));
                } else {
                    $batch = $migrationRunner->run($tenant, $this->option('fresh'));
                    $this->line("  Batch: {$batch}");
                }
            } catch (\Throwable $e) {
                $this->error("  Failed: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }

    protected function resolveTenants()
    {
        $query = Tenant::query()->whereIn('status', ['active', 'provisioning']);

        if ($tenantRef = $this->option('tenant')) {
            $query->where(function ($q) use ($tenantRef) {
                $q->where('slug', $tenantRef)->orWhere('id', $tenantRef);
            });
        }

        return $query->with('database')->get()->filter(fn ($t) => $t->database !== null);
    }
}
