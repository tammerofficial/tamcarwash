<?php

namespace App\Console\Commands;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class TenantsCreateCommand extends Command
{
    protected $signature = 'tenants:create
                            {name : Tenant display name}
                            {--slug= : Tenant slug (auto-generated if omitted)}
                            {--email= : Tenant contact email}
                            {--owner-email= : Owner login email}
                            {--owner-password= : Owner login password (auto-generated if omitted)}
                            {--owner-name= : Owner display name}
                            {--plan= : Plan slug}
                            {--skip-seed : Skip tenant seeding step}
                            {--force : Re-run completed provisioning steps}';

    protected $description = 'Create and provision a new tenant';

    public function handle(TenantProvisioningService $provisioningService): int
    {
        $slug = $this->option('slug') ?: Str::slug($this->argument('name'));

        if (Tenant::query()->where('slug', $slug)->exists()) {
            $this->error("Tenant with slug [{$slug}] already exists.");

            return self::FAILURE;
        }

        $planId = null;

        if ($planSlug = $this->option('plan')) {
            $planId = Plan::query()->where('slug', $planSlug)->value('id');

            if (! $planId) {
                $this->error("Plan [{$planSlug}] not found.");

                return self::FAILURE;
            }
        }

        $tenant = Tenant::query()->create([
            'name' => $this->argument('name'),
            'slug' => $slug,
            'email' => $this->option('email'),
            'status' => 'provisioning',
            'plan_id' => $planId,
        ]);

        $this->info("Created tenant [{$tenant->name}] ({$tenant->id})");

        $results = $provisioningService->provision($tenant, [
            'skip_seed' => $this->option('skip-seed'),
            'force' => $this->option('force'),
            'owner_email' => $this->option('owner-email'),
            'owner_password' => $this->option('owner-password'),
            'owner_name' => $this->option('owner-name'),
        ]);

        foreach ($results as $step => $result) {
            $status = strtoupper($result['status']);
            $message = $result['message'] ?? '';
            $this->line("  [{$status}] {$step}: {$message}");
        }

        $this->info('Tenant provisioning complete.');

        return self::SUCCESS;
    }
}
