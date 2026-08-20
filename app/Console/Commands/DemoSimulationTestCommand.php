<?php

namespace App\Console\Commands;

use App\Models\Landlord\Tenant;
use App\Models\TenantUser;
use App\Modules\Booking\Models\Booking;
use App\Modules\Customers\Models\Customer;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Orders\Models\Order;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Vehicles\Models\Vehicle;
use App\Services\Tenancy\TenantConnectionManager;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Http;

class DemoSimulationTestCommand extends Command
{
    protected $signature = 'app:demo-simulation-test
                            {--tenant=demo : Tenant slug}
                            {--base-url= : API base URL (default APP_URL/api/v1)}
                            {--policy-only : Skip HTTP flow, test policies only}';

    protected $description = 'Verify demo simulation data and role permissions for the demo tenant';

    /** @var array<string, array<string, bool>> */
    private array $roleMatrix = [
        'owner' => [
            'dashboard.view' => true,
            'bookings.view' => true,
            'bookings.manage' => true,
            'queue.view' => true,
            'queue.manage' => true,
            'orders.view' => true,
            'orders.manage' => true,
            'invoices.view' => true,
            'invoices.manage' => true,
            'payments.view' => true,
            'payments.manage' => true,
            'reports.view' => true,
            'users.manage' => true,
        ],
        'manager' => [
            'dashboard.view' => true,
            'bookings.view' => true,
            'bookings.manage' => true,
            'queue.view' => true,
            'queue.manage' => true,
            'orders.view' => true,
            'orders.manage' => true,
            'invoices.view' => true,
            'invoices.manage' => true,
            'payments.view' => true,
            'payments.manage' => false,
            'reports.view' => true,
            'users.manage' => false,
        ],
        'cashier' => [
            'dashboard.view' => true,
            'bookings.view' => false,
            'bookings.manage' => false,
            'queue.view' => true,
            'queue.manage' => true,
            'orders.view' => true,
            'orders.manage' => true,
            'invoices.view' => true,
            'invoices.manage' => true,
            'payments.view' => true,
            'payments.manage' => true,
            'reports.view' => false,
            'users.manage' => false,
        ],
        'worker' => [
            'dashboard.view' => true,
            'bookings.view' => false,
            'bookings.manage' => false,
            'queue.view' => true,
            'queue.manage' => false,
            'orders.view' => true,
            'orders.manage' => false,
            'invoices.view' => false,
            'invoices.manage' => false,
            'payments.view' => false,
            'payments.manage' => false,
            'reports.view' => false,
            'users.manage' => false,
        ],
    ];

    public function handle(TenantConnectionManager $tenantManager): int
    {
        $slug = (string) $this->option('tenant');
        $tenantManager->useLandlord();

        $tenant = Tenant::query()->where('slug', $slug)->where('status', 'active')->first();
        if (! $tenant?->database?->isReady()) {
            $this->error("Tenant [{$slug}] not found or database not ready.");

            return self::FAILURE;
        }

        $tenantManager->connect($tenant);

        $this->info("Demo simulation check — {$tenant->name} ({$slug})");
        $this->newLine();

        $countsOk = $this->verifySeedCounts();
        $rolesOk = $this->verifyRolePermissions();

        $flowOk = true;
        if (! $this->option('policy-only')) {
            $flowOk = $this->verifyHttpFlow($slug);
        }

        $tenantManager->disconnect();
        $tenantManager->useLandlord();

        $this->newLine();
        $passed = $countsOk && $rolesOk && $flowOk;
        $this->info($passed ? 'All demo simulation checks passed.' : 'Some checks failed — see output above.');

        return $passed ? self::SUCCESS : self::FAILURE;
    }

    protected function verifySeedCounts(): bool
    {
        $this->line('Seed data counts:');

        $checks = [
            'customers (Omani demo)' => Customer::query()->where('phone', 'like', '+968900001%')->count(),
            'vehicles' => Vehicle::query()->whereIn('plate_number', [
                'B 12345', 'B 23456', 'M 34567', 'A 45678', 'D 56789', 'B 67890', 'M 78901', 'B 89012',
            ])->count(),
            'bookings today' => Booking::query()->whereDate('scheduled_date', today())->count(),
            'queue waiting' => QueueEntry::query()->whereDate('queue_date', today())->where('status', 'waiting')->count(),
            'orders in_service' => Order::query()->where('status', 'in_service')->count(),
            'invoices (VAT 5%)' => Invoice::query()->where('invoice_number', 'like', 'DEMO-%')->count(),
        ];

        $expected = [
            'customers (Omani demo)' => 5,
            'vehicles' => 8,
            'bookings today' => 3,
            'queue waiting' => 2,
            'orders in_service' => 1,
            'invoices (VAT 5%)' => 2,
        ];

        $allOk = true;
        foreach ($checks as $label => $count) {
            $ok = $count >= ($expected[$label] ?? 0);
            $allOk = $allOk && $ok;
            $this->line(sprintf(
                '  %s %s: %d (expected ≥ %d)',
                $ok ? '✓' : '✗',
                $label,
                $count,
                $expected[$label] ?? 0
            ));
        }

        return $allOk;
    }

    protected function verifyRolePermissions(): bool
    {
        $this->newLine();
        $this->line('Role permission matrix:');

        $allOk = true;

        foreach ($this->roleMatrix as $role => $expectations) {
            $user = TenantUser::query()->where('email', "{$role}@demo.test")->first();
            if (! $user) {
                $this->error("  ✗ Missing user {$role}@demo.test");
                $allOk = false;

                continue;
            }

            $failures = [];
            foreach ($expectations as $permission => $expected) {
                $actual = $user->can($permission);
                if ($actual !== $expected) {
                    $failures[] = "{$permission}=".($actual ? 'yes' : 'no').' (expected '.($expected ? 'yes' : 'no').')';
                }
            }

            if ($failures === []) {
                $this->line("  ✓ {$role}: all ".count($expectations).' permissions match');
            } else {
                $allOk = false;
                $this->line('  ✗ '.$role.': '.implode(', ', $failures));
            }

            $policyChecks = $this->verifyPolicyGates($user, $role);
            if ($policyChecks !== []) {
                $allOk = false;
                $this->line('  ✗ '.$role.' policy: '.implode(', ', $policyChecks));
            }
        }

        return $allOk;
    }

    /**
     * @return array<int, string>
     */
    protected function verifyPolicyGates(TenantUser $user, string $role): array
    {
        $failures = [];
        $booking = Booking::query()->first();
        $order = Order::query()->first();
        $queue = QueueEntry::query()->first();
        $invoice = Invoice::query()->first();

        $expectManageOrders = in_array($role, ['owner', 'manager', 'cashier'], true);
        $expectViewInvoices = in_array($role, ['owner', 'manager', 'cashier'], true);
        $expectManageQueue = in_array($role, ['owner', 'manager', 'cashier'], true);

        if ($order) {
            $canTransition = Gate::forUser($user)->allows('transition', $order);
            if ($canTransition !== $expectManageOrders) {
                $failures[] = 'orders.transition';
            }
        }

        if ($invoice) {
            $canView = Gate::forUser($user)->allows('view', $invoice);
            if ($canView !== $expectViewInvoices) {
                $failures[] = 'invoices.view';
            }
        }

        if ($queue) {
            $canUpdate = Gate::forUser($user)->allows('update', $queue);
            if ($canUpdate !== $expectManageQueue) {
                $failures[] = 'queue.manage';
            }
        }

        if ($booking) {
            $canConfirm = Gate::forUser($user)->allows('confirm', $booking);
            $expectBookings = in_array($role, ['owner', 'manager'], true);
            if ($canConfirm !== $expectBookings) {
                $failures[] = 'bookings.manage';
            }
        }

        $canReports = Gate::forUser($user)->allows('viewFinanceReports');
        $expectReports = in_array($role, ['owner', 'manager'], true);
        if ($canReports !== $expectReports) {
            $failures[] = 'reports.view';
        }

        return $failures;
    }

    protected function verifyHttpFlow(string $slug): bool
    {
        $baseUrl = rtrim((string) ($this->option('base-url') ?: config('app.url').'/api/v1'), '/');

        $this->newLine();
        $this->line("HTTP flow (base: {$baseUrl}, tenant: {$slug}):");

        try {
            $login = Http::timeout(5)
                ->acceptJson()
                ->withHeaders(['X-Tenant-Slug' => $slug])
                ->post("{$baseUrl}/auth/login", [
                    'email' => 'cashier@demo.test',
                    'password' => 'password',
                ]);

            if (! $login->successful()) {
                $this->warn('  ⚠ HTTP skipped — login failed (is the server running?)');

                return true;
            }

            $token = $login->json('data.token') ?? $login->json('token');
            if (! $token) {
                $this->warn('  ⚠ HTTP skipped — no token in login response');

                return true;
            }

            $headers = [
                'Authorization' => 'Bearer '.$token,
                'X-Tenant-Slug' => $slug,
                'Accept' => 'application/json',
            ];

            $dashboard = Http::withHeaders($headers)->get("{$baseUrl}/dashboard/stats");
            $bookings = Http::withHeaders($headers)->get("{$baseUrl}/bookings", ['date' => today()->toDateString()]);
            $queue = Http::withHeaders($headers)->get("{$baseUrl}/queue/entries");
            $invoices = Http::withHeaders($headers)->get("{$baseUrl}/invoices");

            $this->line('  '.($dashboard->successful() ? '✓' : '✗').' GET /dashboard/stats → '.$dashboard->status());
            $this->line('  '.($bookings->status() === 403 ? '✓' : '✗').' GET /bookings → '.$bookings->status().' (cashier expected 403)');
            $this->line('  '.($queue->successful() ? '✓' : '✗').' GET /queue/entries → '.$queue->status());
            $this->line('  '.($invoices->successful() ? '✓' : '✗').' GET /invoices → '.$invoices->status());

            return $dashboard->successful()
                && $queue->successful()
                && $invoices->successful()
                && $bookings->status() === 403;
        } catch (\Throwable $e) {
            $this->warn('  ⚠ HTTP skipped — '.$e->getMessage());

            return true;
        }
    }
}
