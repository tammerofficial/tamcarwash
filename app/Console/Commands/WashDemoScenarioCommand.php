<?php

namespace App\Console\Commands;

use App\Services\Tenancy\WashDemoScenarioService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class WashDemoScenarioCommand extends Command
{
    protected $signature = 'tammer:wash-demo-scenario
                            {--tenant=alwadi-wash2df : Tenant slug for operational data (alwadi-wash or alwadi-wash2df)}';

    protected $description = 'Seed idempotent landlord SaaS demo (plans, tenants, subscriptions) and Al Wadi tenant business data';

    public function handle(WashDemoScenarioService $scenarioService): int
    {
        $tenantSlug = (string) $this->option('tenant');

        $this->info('Tammer Wash demo scenario — idempotent seed (safe to rerun)');
        Log::info('[tammer:wash-demo-scenario] started', ['tenant' => $tenantSlug]);

        try {
            $summary = $scenarioService->run($tenantSlug);
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            Log::error('[tammer:wash-demo-scenario] failed', ['error' => $e->getMessage()]);

            return self::FAILURE;
        }

        $this->newLine();
        $this->line('<fg=cyan>Landlord SaaS</>');
        foreach ($summary['landlord'] as $key => $value) {
            $this->line("  {$key}: {$value}");
        }

        $this->newLine();
        $this->line('<fg=cyan>Tenant operational ('.$tenantSlug.')</>');
        if ($summary['tenant']['skipped'] ?? false) {
            $this->warn('  '.$summary['tenant']['reason']);
        } else {
            foreach ($summary['tenant'] as $key => $value) {
                $this->line("  {$key}: {$value}");
            }
        }

        $this->newLine();
        $this->info('Demo scenario complete.');
        $this->table(
            ['Tenant slug', 'Use for'],
            [
                ['alwadi-wash2df', 'Primary demo tenant (default) — full operational data'],
                ['alwadi-wash', 'Alternate Al Wadi slug — landlord + optional re-seed'],
                ['sohar-fast-wash', 'Starter trial (7 days) — landlord only'],
                ['elite-detailing', 'Enterprise active — landlord only'],
            ]
        );

        Log::info('[tammer:wash-demo-scenario] completed', $summary);

        return self::SUCCESS;
    }
}
