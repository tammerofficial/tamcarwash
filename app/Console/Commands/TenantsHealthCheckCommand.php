<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class TenantsHealthCheckCommand extends Command
{
    protected $signature = 'tenants:health-check
                            {--tenant= : Specific tenant slug or ID}
                            {--json : Output as JSON}';

    protected $description = 'Check health of tenant database connections';

    public function handle(TenantConnectionManager $connectionManager): int
    {
        $tenants = Tenant::query()
            ->when($this->option('tenant'), function ($q, $ref) {
                $q->where(function ($inner) use ($ref) {
                    $inner->where('slug', $ref)->orWhere('id', $ref);
                });
            })
            ->with(['database', 'domains'])
            ->get();

        $results = [];
        $allHealthy = true;

        foreach ($tenants as $tenant) {
            $result = $this->checkTenant($tenant, $connectionManager);
            $results[] = $result;

            if (! $result['healthy']) {
                $allHealthy = false;
            }
        }

        if ($this->option('json')) {
            $this->line(json_encode($results, JSON_PRETTY_PRINT));
        } else {
            $headers = ['Tenant', 'Slug', 'Status', 'DB', 'Connection', 'Latency'];
            $rows = collect($results)->map(fn ($r) => [
                $r['name'],
                $r['slug'],
                $r['status'],
                $r['database_status'],
                $r['connection'] ? 'OK' : 'FAIL',
                $r['latency_ms'] !== null ? "{$r['latency_ms']}ms" : 'N/A',
            ])->toArray();

            $this->table($headers, $rows);
        }

        return $allHealthy ? self::SUCCESS : self::FAILURE;
    }

    protected function checkTenant(Tenant $tenant, TenantConnectionManager $connectionManager): array
    {
        $result = [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'status' => $tenant->status,
            'database_status' => $tenant->database?->status ?? 'missing',
            'connection' => false,
            'latency_ms' => null,
            'healthy' => false,
            'error' => null,
        ];

        if (! $tenant->database) {
            $result['error'] = 'No database record';

            return $result;
        }

        try {
            $started = microtime(true);
            $connectionManager->connect($tenant);
            DB::connection(config('tenancy.tenant_connection'))->select('SELECT 1');
            $result['latency_ms'] = (int) ((microtime(true) - $started) * 1000);
            $result['connection'] = true;
            $result['healthy'] = $tenant->status === 'active' && $tenant->database->isReady();
        } catch (\Throwable $e) {
            $result['error'] = $e->getMessage();
        } finally {
            $connectionManager->useLandlord();
        }

        return $result;
    }
}
