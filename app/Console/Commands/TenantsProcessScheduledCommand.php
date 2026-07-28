<?php

namespace App\Console\Commands;

use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;
use App\Models\Landlord\TenantProvisioningLog;
use App\Services\Landlord\SubscriptionLifecycleService;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TenantsProcessScheduledCommand extends Command
{
    protected $signature = 'tenants:process-scheduled
                            {--dry-run : Report actions without applying changes}
                            {--heartbeat-url= : Optional Forge/monitoring heartbeat URL}';

    protected $description = 'Process pending tenants, retry provisioning, and expire trials/subscriptions';

    public function handle(
        TenantProvisioningService $provisioningService,
        TenantConnectionManager $connectionManager,
        SubscriptionLifecycleService $subscriptionLifecycle,
    ): int {
        $dryRun = (bool) $this->option('dry-run');
        $summary = [
            'provisioned' => 0,
            'provisioning_retried' => 0,
            'provisioning_failed' => 0,
            'trials_expired' => 0,
            'subscriptions_overdue' => 0,
        ];

        if ($dryRun) {
            $this->warn('Dry run — no changes will be persisted.');
        }

        $pendingTenants = Tenant::query()
            ->whereIn('status', ['pending', 'provisioning'])
            ->with(['database', 'plan'])
            ->orderBy('created_at')
            ->get();

        foreach ($pendingTenants as $tenant) {
            $this->line("Processing tenant: {$tenant->slug} ({$tenant->status})");

            if ($dryRun) {
                $summary['provisioning_retried']++;

                continue;
            }

            try {
                $connectionManager->useLandlord();
                $provisioningService->provision($tenant, ['force' => false]);
                $summary['provisioned']++;
                $this->info("  Provisioned: {$tenant->slug}");
            } catch (\Throwable $e) {
                $summary['provisioning_failed']++;
                $this->error("  Failed: {$e->getMessage()}");
                Log::error('[tenants:process-scheduled] provisioning failed', [
                    'tenant_id' => $tenant->id,
                    'slug' => $tenant->slug,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $stuckTenants = Tenant::query()
            ->where('status', 'provisioning')
            ->whereHas('provisioningLogs', function ($query) {
                $query->where('status', 'failed');
            })
            ->with('provisioningLogs')
            ->get();

        foreach ($stuckTenants as $tenant) {
            $failedStep = $tenant->provisioningLogs
                ->where('status', 'failed')
                ->sortByDesc('updated_at')
                ->first();

            $this->line("Retrying failed step [{$failedStep?->step}] for {$tenant->slug}");

            if ($dryRun) {
                $summary['provisioning_retried']++;

                continue;
            }

            try {
                $connectionManager->useLandlord();
                TenantProvisioningLog::query()
                    ->where('tenant_id', $tenant->id)
                    ->where('step', $failedStep?->step)
                    ->where('status', 'failed')
                    ->update(['status' => 'pending']);

                $provisioningService->provision($tenant, ['force' => true]);
                $summary['provisioning_retried']++;
                $this->info("  Retry succeeded: {$tenant->slug}");
            } catch (\Throwable $e) {
                $summary['provisioning_failed']++;
                $this->error("  Retry failed: {$e->getMessage()}");
            }
        }

        if ($dryRun) {
            $summary['trials_expired'] = Tenant::query()
                ->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '<', now())
                ->where('status', 'active')
                ->count();

            $summary['subscriptions_overdue'] = Subscription::query()
                ->whereIn('status', ['active', 'trial'])
                ->whereNotNull('ends_at')
                ->where('ends_at', '<', now())
                ->count();
        } else {
            $lifecycleSummary = $subscriptionLifecycle->processDueSubscriptions();
            $summary['trials_expired'] = $lifecycleSummary['trials_expired'];
            $summary['subscriptions_overdue'] = $lifecycleSummary['subscriptions_overdue'];
        }

        $this->newLine();
        $this->table(
            ['Metric', 'Count'],
            collect($summary)->map(fn ($value, $key) => [$key, $value])->values()->all()
        );

        Log::info('[tenants:process-scheduled] completed', $summary + ['dry_run' => $dryRun]);

        $this->sendHeartbeat($summary);

        return $summary['provisioning_failed'] > 0 ? self::FAILURE : self::SUCCESS;
    }

    protected function sendHeartbeat(array $summary): void
    {
        $url = $this->option('heartbeat-url') ?: env('FORGE_HEARTBEAT_URL');

        if (blank($url)) {
            $this->comment('Heartbeat skipped (no FORGE_HEARTBEAT_URL).');

            return;
        }

        try {
            Http::timeout(10)->get($url);
            $this->info('Heartbeat sent.');
        } catch (\Throwable $e) {
            $this->warn("Heartbeat failed: {$e->getMessage()}");
        }
    }
}
