<?php

namespace App\Modules\Shared\Http\Controllers;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Orders\Models\Order;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Models\QueueEntry;
use App\Services\Landlord\TenantPlanService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends ApiController
{
    public function __construct(
        protected TenantPlanService $tenantPlanService,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('dashboard.view'), 403);

        $branchId = $request->integer('branch_id') ?: null;
        $today = now()->toDateString();

        $ordersQuery = Order::query()->whereDate('created_at', $today);
        $invoicesQuery = Invoice::query()->whereDate('issue_date', $today);
        $bookingsQuery = Booking::query()
            ->whereIn('status', [BookingStatus::Pending, BookingStatus::Confirmed]);
        $queueQuery = QueueEntry::query()->where('status', QueueEntryStatus::Waiting);

        if ($branchId) {
            $ordersQuery->where('branch_id', $branchId);
            $invoicesQuery->where('branch_id', $branchId);
            $bookingsQuery->where('branch_id', $branchId);
            $queueQuery->where('branch_id', $branchId);
        }

        $revenueTrend = Invoice::query()
            ->select([
                DB::raw('DATE(issue_date) as date'),
                DB::raw('SUM(total) as revenue'),
            ])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->where('issue_date', '>=', now()->subDays(6)->toDateString())
            ->groupBy(DB::raw('DATE(issue_date)'))
            ->orderBy('date')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'revenue' => (float) $row->revenue,
            ])
            ->values()
            ->all();

        $ordersByStatus = Order::query()
            ->select('status', DB::raw('COUNT(*) as count'))
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->whereDate('created_at', $today)
            ->groupBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => (string) $row->status,
                'count' => (int) $row->count,
            ])
            ->values()
            ->all();

        $planMeta = $this->tenantPlanService->getPlanMeta();

        // Post-registration simulation (curl):
        // 1. POST /api/landlord/v1/tenants/register { slug: test-wash-sim, plan_slug: starter, ... }
        // 2. POST /api/v1/auth/login with X-Tenant-Slug: test-wash-sim
        // 3. GET /api/v1/dashboard/stats — expect plan.plan_slug, subscription_ends_at, days_remaining

        return $this->success([
            'today_orders' => $ordersQuery->count(),
            'today_revenue' => (float) $invoicesQuery->sum('total'),
            'queue_waiting' => $queueQuery->count(),
            'active_bookings' => $bookingsQuery->count(),
            'revenue_trend' => $revenueTrend,
            'orders_by_status' => $ordersByStatus,
            'top_services' => [],
            'plan' => $planMeta,
        ]);
    }
}
