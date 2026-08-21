<?php

namespace App\Services\Tenancy;

use App\Models\Landlord\Tenant;
use Database\Seeders\TenantProductionSeeder;
use Database\Seeders\WashDemoLandlordSeeder;
use Database\Seeders\WashDemoTenantSeeder;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schema;

class WashDemoScenarioService
{
    /** @var array<int, string> */
    public const ALWADI_SLUGS = ['alwadi-wash', 'alwadi-wash2df'];

    public function __construct(
        protected TenantConnectionManager $tenantManager,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function run(string $tenantSlug): array
    {
        $summary = [
            'landlord' => [],
            'tenant' => null,
            'tenant_slug' => $tenantSlug,
        ];

        $this->tenantManager->useLandlord();
        Artisan::call('db:seed', [
            '--class' => WashDemoLandlordSeeder::class,
            '--force' => true,
            '--database' => 'landlord',
        ]);
        $summary['landlord'] = $this->landlordCounts();

        if (! in_array($tenantSlug, self::ALWADI_SLUGS, true)) {
            $summary['tenant'] = ['skipped' => true, 'reason' => 'Operational data only seeded for alwadi tenants'];

            return $summary;
        }

        $tenant = Tenant::query()->where('slug', $tenantSlug)->first();
        if (! $tenant?->database?->isReady()) {
            throw new \RuntimeException("Tenant [{$tenantSlug}] not found or database not ready.");
        }

        $this->tenantManager->connect($tenant);

        Artisan::call('db:seed', [
            '--class' => TenantProductionSeeder::class,
            '--force' => true,
            '--database' => config('tenancy.tenant_connection', 'tenant'),
        ]);

        Artisan::call('db:seed', [
            '--class' => WashDemoTenantSeeder::class,
            '--force' => true,
            '--database' => config('tenancy.tenant_connection', 'tenant'),
        ]);

        $summary['tenant'] = $this->tenantCounts();

        $this->tenantManager->disconnect();
        $this->tenantManager->useLandlord();

        return $summary;
    }

    /**
     * @return array<string, int|float>
     */
    protected function landlordCounts(): array
    {
        if (! Schema::connection('landlord')->hasTable('tenants')) {
            return [];
        }

        return [
            'plans' => \App\Models\Landlord\Plan::query()->count(),
            'tenants' => Tenant::query()->whereIn('slug', [
                'alwadi-wash', 'alwadi-wash2df', 'sohar-fast-wash', 'elite-detailing',
            ])->count(),
            'subscriptions' => \App\Models\Landlord\Subscription::query()->count(),
            'mrr' => round((float) \App\Models\Landlord\Subscription::query()
                ->whereIn('status', ['active', 'trial'])
                ->sum('amount'), 2),
        ];
    }

    /**
     * @return array<string, int>
     */
    protected function tenantCounts(): array
    {
        return [
            'branches' => \App\Modules\Branches\Models\Branch::query()->count(),
            'services' => \App\Modules\Services\Models\Service::query()->count(),
            'workers' => \App\Models\TenantUser::query()->where('email', 'like', '%@alwadi.test')->whereHas('roles', fn ($q) => $q->where('name', 'worker'))->count(),
            'customers' => \App\Modules\Customers\Models\Customer::query()->count(),
            'orders' => \App\Modules\Orders\Models\Order::query()->count(),
            'invoices' => \App\Modules\Finance\Models\Invoice::query()->count(),
            'expenses' => Schema::hasTable('expenses') ? \App\Modules\Finance\Models\Expense::query()->count() : 0,
            'bookings_today' => \App\Modules\Booking\Models\Booking::query()->whereDate('scheduled_date', today())->count(),
            'bookings_total' => \App\Modules\Booking\Models\Booking::query()->count(),
            'queue_waiting' => \App\Modules\Queue\Models\QueueEntry::query()->where('status', 'waiting')->whereDate('queue_date', today())->count(),
            'queue_today' => \App\Modules\Queue\Models\QueueEntry::query()->whereDate('queue_date', today())->count(),
            'orders_active' => \App\Modules\Orders\Models\Order::query()->whereNotIn('status', ['completed', 'cancelled'])->count(),
            'invoices_today' => \App\Modules\Finance\Models\Invoice::query()->whereDate('issue_date', today())->count(),
        ];
    }
}
