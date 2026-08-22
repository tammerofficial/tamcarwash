<?php

namespace App\Modules\Analytics\Services;

use App\Models\User;
use App\Modules\Orders\Models\Order;
use App\Modules\Customers\Models\Customer;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Finance\Models\Payment;
use App\Modules\Branches\Models\Branch;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Support\Facades\DB;
use stdClass;

class AnalyticsService
{
    public function getExecutiveSummary(?Carbon $date = null, ?int $branchId = null): array
    {
        $date = $date ?? now();
        $yesterday = $date->copy()->subDay();

        $todayRevenue = $this->getTodayRevenue($date, $branchId);
        $lastDayRevenue = $this->getTodayRevenue($yesterday, $branchId);
        $revenueGrowth = $lastDayRevenue > 0 
            ? (($todayRevenue - $lastDayRevenue) / $lastDayRevenue) * 100 
            : 0;

        return [
            'today_revenue' => round($todayRevenue, 3),
            'active_customers_today' => $this->getActiveCustomersToday($date, $branchId),
            'queue_depth' => $this->getQueueDepth($date, $branchId),
            'staff_on_duty' => $this->getStaffOnDuty($date, $branchId),
            'revenue_growth_percent' => round($revenueGrowth, 2),
            'last_day_revenue' => round($lastDayRevenue, 3),
        ];
    }

    public function getRevenueAnalytics(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        return [
            'daily_revenue' => $this->getDailyRevenueChart($startDate, $endDate, $branchId),
            'revenue_by_service' => $this->getRevenueByService($startDate, $endDate, $branchId),
            'revenue_by_branch' => $this->getRevenueByBranch($startDate, $endDate),
            'revenue_vs_target' => $this->getRevenueVsTarget($startDate, $endDate, $branchId),
            'trend_7day' => $this->calculateTrend($startDate, $endDate, $branchId, 7),
            'trend_30day' => $this->calculateTrend($startDate, $endDate, $branchId, 30),
            'trend_90day' => $this->calculateTrend($startDate, $endDate, $branchId, 90),
        ];
    }

    public function getCustomerAnalytics(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        $totalCustomers = $this->getTotalCustomers($branchId);
        $newCustomersThisMonth = $this->getNewCustomersThisMonth($branchId);
        $repeatCustomerRate = $this->getRepeatCustomerRate($branchId);
        $topCustomers = $this->getTopCustomers($startDate, $endDate, $branchId, 10);

        return [
            'total_customers' => $totalCustomers,
            'new_customers_this_month' => $newCustomersThisMonth,
            'repeat_customer_rate' => round($repeatCustomerRate, 2),
            'customer_satisfaction' => $this->getCustomerSatisfaction($branchId),
            'top_customers' => $topCustomers,
            'customer_growth' => $this->getCustomerGrowthTrend($startDate, $endDate, $branchId),
        ];
    }

    public function getOperationsAnalytics(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        return [
            'average_wait_time' => round($this->getAverageWaitTime($startDate, $endDate, $branchId), 2),
            'queue_efficiency' => round($this->getQueueEfficiency($startDate, $endDate, $branchId), 2),
            'service_completion_rate' => round($this->getServiceCompletionRate($startDate, $endDate, $branchId), 2),
            'peak_hours' => $this->getPeakHoursAnalysis($startDate, $endDate, $branchId),
            'busiest_day_of_week' => $this->getBusiestDayOfWeek($startDate, $endDate, $branchId),
            'daily_operations' => $this->getDailyOperationsTrend($startDate, $endDate, $branchId),
        ];
    }

    public function getFinancialReports(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        $totalRevenue = $this->getTotalRevenue($startDate, $endDate, $branchId);
        $totalTax = $this->getTotalTax($startDate, $endDate, $branchId);

        return [
            'daily_revenue_breakdown' => $this->getDailyRevenueBreakdown($startDate, $endDate, $branchId),
            'tax_report' => [
                'total_revenue' => round($totalRevenue, 3),
                'tax_rate' => 5.0,
                'tax_amount' => round($totalTax, 3),
                'net_amount' => round($totalRevenue - $totalTax, 3),
            ],
            'payment_method_breakdown' => $this->getPaymentMethodBreakdown($startDate, $endDate, $branchId),
            'outstanding_payments' => $this->getOutstandingPayments($branchId),
            'profit_analysis' => $this->getProfitAnalysis($startDate, $endDate, $branchId),
        ];
    }

    public function getStaffPerformance(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        return [
            'services_per_staff' => $this->getServicesPerStaff($startDate, $endDate, $branchId),
            'average_rating_per_staff' => $this->getAverageRatingPerStaff($startDate, $endDate, $branchId),
            'staff_efficiency' => $this->getStaffEfficiency($startDate, $endDate, $branchId),
            'attendance_tracking' => $this->getAttendanceTracking($startDate, $endDate, $branchId),
        ];
    }

    public function getLoyaltyRetention(?Carbon $startDate = null, ?Carbon $endDate = null, ?int $branchId = null): array
    {
        $startDate = $startDate ?? now()->subDays(30);
        $endDate = $endDate ?? now();

        return [
            'loyalty_points_distributed' => $this->getLoyaltyPointsDistributed($startDate, $endDate, $branchId),
            'repeat_visit_rate' => round($this->getRepeatVisitRate($startDate, $endDate, $branchId), 2),
            'customer_churn_rate' => round($this->getCustomerChurnRate($startDate, $endDate, $branchId), 2),
            'redemption_rate' => round($this->getRedemptionRate($startDate, $endDate, $branchId), 2),
        ];
    }

    // REVENUE CALCULATIONS

    private function getTodayRevenue(?Carbon $date = null, ?int $branchId = null): float
    {
        $date = $date ?? now();
        $query = Payment::query()
            ->whereDate('paid_at', $date->toDateString())
            ->where('status', 'completed');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->sum(DB::raw('amount')) ?? 0;
    }

    private function getTotalRevenue(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = Payment::query()
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'completed');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->sum(DB::raw('amount')) ?? 0;
    }

    private function getDailyRevenueChart(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $data = [];
        foreach (CarbonPeriod::create($startDate, $endDate) as $date) {
            $revenue = $this->getTodayRevenue($date, $branchId);
            $data[] = [
                'date' => $date->format('Y-m-d'),
                'revenue' => round($revenue, 3),
                'day_name' => $date->format('l'),
            ];
        }

        return $data;
    }

    private function getDailyRevenueBreakdown(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Payment::query()
            ->select(DB::raw('DATE(paid_at) as date'), DB::raw('SUM(amount) as total'))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy(DB::raw('DATE(paid_at)'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->orderBy('date')->get()
            ->map(fn ($row) => [
                'date' => $row->date,
                'revenue' => round((float) $row->total, 3),
            ])
            ->toArray();
    }

    private function getRevenueByService(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Order::query()
            ->select(DB::raw('service_category_id'), DB::raw('SUM(total_amount) as total'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy('service_category_id');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(fn ($row) => [
                'service_id' => $row->service_category_id,
                'revenue' => round((float) $row->total, 3),
            ])
            ->toArray();
    }

    private function getRevenueByBranch(?Carbon $startDate, ?Carbon $endDate): array
    {
        $data = Payment::query()
            ->select(DB::raw('branch_id'), DB::raw('SUM(amount) as total'))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy('branch_id')
            ->get();

        return $data->map(function ($row) {
            $branch = Branch::find($row->branch_id);
            return [
                'branch_id' => $row->branch_id,
                'branch_name' => $branch?->name ?? 'Unknown',
                'revenue' => round((float) $row->total, 3),
            ];
        })->toArray();
    }

    private function getRevenueVsTarget(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $totalRevenue = $this->getTotalRevenue($startDate, $endDate, $branchId);
        $days = $startDate->diffInDays($endDate) + 1;
        $targetPerDay = 500; // Default target, should be configurable
        $totalTarget = $targetPerDay * $days;
        $percentageOfTarget = $totalTarget > 0 ? ($totalRevenue / $totalTarget) * 100 : 0;

        return [
            'actual_revenue' => round($totalRevenue, 3),
            'target_revenue' => round($totalTarget, 3),
            'percentage_of_target' => round($percentageOfTarget, 2),
            'variance' => round($totalRevenue - $totalTarget, 3),
        ];
    }

    private function calculateTrend(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null, int $days = 7): float
    {
        $currentEnd = $endDate->copy();
        $currentStart = $currentEnd->copy()->subDays($days);
        $previousEnd = $currentStart->copy()->subDay();
        $previousStart = $previousEnd->copy()->subDays($days);

        $currentRevenue = $this->getTotalRevenue($currentStart, $currentEnd, $branchId);
        $previousRevenue = $this->getTotalRevenue($previousStart, $previousEnd, $branchId);

        if ($previousRevenue == 0) {
            return 0;
        }

        return (($currentRevenue - $previousRevenue) / $previousRevenue) * 100;
    }

    private function getTotalTax(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->sum(DB::raw('tax_amount')) ?? 0;
    }

    // CUSTOMER CALCULATIONS

    private function getActiveCustomersToday(?Carbon $date = null, ?int $branchId = null): int
    {
        $date = $date ?? now();
        $query = Order::query()
            ->whereDate('created_at', $date->toDateString())
            ->distinct('customer_id');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->count('customer_id');
    }

    private function getTotalCustomers(?int $branchId = null): int
    {
        $query = Customer::query();

        if ($branchId) {
            // Filter by customers with orders in this branch
            $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
        }

        return $query->count();
    }

    private function getNewCustomersThisMonth(?int $branchId = null): int
    {
        $query = Customer::query()
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year);

        if ($branchId) {
            $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
        }

        return $query->count();
    }

    private function getRepeatCustomerRate(?int $branchId = null): float
    {
        $query = Customer::query()
            ->withCount('orders as order_count');

        if ($branchId) {
            $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
        }

        $customers = $query->get();
        $repeatCustomers = $customers->filter(fn ($c) => $c->order_count > 1)->count();
        $totalCustomers = $customers->count();

        return $totalCustomers > 0 ? ($repeatCustomers / $totalCustomers) * 100 : 0;
    }

    private function getTopCustomers(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null, int $limit = 10): array
    {
        $query = Order::query()
            ->select(DB::raw('customer_id'), DB::raw('SUM(total_amount) as total_spent'), DB::raw('COUNT(*) as orders_count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->whereNotNull('customer_id')
            ->groupBy('customer_id')
            ->orderByDesc(DB::raw('SUM(total_amount)'))
            ->limit($limit);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(function ($row) {
                $customer = Customer::find($row->customer_id);
                return [
                    'customer_id' => $row->customer_id,
                    'customer_name' => $customer?->name ?? 'Unknown',
                    'total_spent' => round((float) $row->total_spent, 3),
                    'orders_count' => $row->orders_count,
                ];
            })
            ->toArray();
    }

    private function getCustomerSatisfaction(?int $branchId = null): float
    {
        // Placeholder - integrate with reviews/ratings system when available
        return 4.5;
    }

    private function getCustomerGrowthTrend(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $data = [];
        foreach (CarbonPeriod::create($startDate, $endDate) as $date) {
            $query = Customer::query()
                ->whereDate('created_at', '<=', $date);

            if ($branchId) {
                $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
            }

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'total_customers' => $query->count(),
            ];
        }

        return $data;
    }

    // QUEUE & OPERATIONS CALCULATIONS

    private function getQueueDepth(?Carbon $date = null, ?int $branchId = null): int
    {
        $date = $date ?? now();
        $query = QueueEntry::query()
            ->whereDate('queue_date', $date->toDateString())
            ->whereIn('status', ['waiting', 'called']);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->count();
    }

    private function getAverageWaitTime(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = QueueEntry::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->whereNotNull('in_service_at')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, in_service_at)) as avg_wait'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $result = $query->first();
        return $result?->avg_wait ?? 0;
    }

    private function getQueueEfficiency(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $totalOrders = $query->count();
        $days = $startDate->diffInDays($endDate) + 1;

        return $days > 0 ? $totalOrders / $days : 0;
    }

    private function getServiceCompletionRate(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = Order::query()
            ->whereBetween('created_at', [$startDate, $endDate]);

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $totalOrders = $query->count();
        $completedOrders = (clone $query)->where('status', 'completed')->count();

        return $totalOrders > 0 ? ($completedOrders / $totalOrders) * 100 : 0;
    }

    private function getPeakHoursAnalysis(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Order::query()
            ->select(DB::raw('HOUR(created_at) as hour'), DB::raw('COUNT(*) as order_count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('HOUR(created_at)'))
            ->orderByDesc(DB::raw('COUNT(*)'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->limit(5)
            ->get()
            ->map(fn ($row) => [
                'hour' => str_pad($row->hour, 2, '0', STR_PAD_LEFT) . ':00',
                'orders' => $row->order_count,
            ])
            ->toArray();
    }

    private function getBusiestDayOfWeek(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Order::query()
            ->select(DB::raw('DAYNAME(created_at) as day_name'), DB::raw('COUNT(*) as order_count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->groupBy(DB::raw('DAYNAME(created_at)'))
            ->orderByDesc(DB::raw('COUNT(*)'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(fn ($row) => [
                'day' => $row->day_name,
                'orders' => $row->order_count,
            ])
            ->toArray();
    }

    private function getDailyOperationsTrend(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $data = [];
        foreach (CarbonPeriod::create($startDate, $endDate) as $date) {
            $query = Order::query()
                ->whereDate('created_at', $date->toDateString());

            if ($branchId) {
                $query->where('branch_id', $branchId);
            }

            $data[] = [
                'date' => $date->format('Y-m-d'),
                'completed_orders' => (clone $query)->where('status', 'completed')->count(),
                'pending_orders' => (clone $query)->where('status', 'pending')->count(),
                'avg_wait_time' => $this->getAverageWaitTimeForDate($date, $branchId),
            ];
        }

        return $data;
    }

    private function getAverageWaitTimeForDate(?Carbon $date, ?int $branchId = null): float
    {
        $query = QueueEntry::query()
            ->whereDate('queue_date', $date->toDateString())
            ->whereNotNull('in_service_at')
            ->select(DB::raw('AVG(TIMESTAMPDIFF(MINUTE, created_at, in_service_at)) as avg_wait'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        $result = $query->first();
        return round($result?->avg_wait ?? 0, 2);
    }

    // STAFF CALCULATIONS

    private function getStaffOnDuty(?Carbon $date = null, ?int $branchId = null): int
    {
        // This would need actual staff/shift tracking
        // Placeholder implementation
        return User::query()
            ->where('status', 'active')
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->count();
    }

    private function getServicesPerStaff(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Order::query()
            ->select(DB::raw('worker_id'), DB::raw('COUNT(*) as services_count'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->whereNotNull('worker_id')
            ->groupBy('worker_id')
            ->orderByDesc(DB::raw('COUNT(*)'));

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(function ($row) {
                $staff = User::find($row->worker_id);
                return [
                    'staff_id' => $row->worker_id,
                    'staff_name' => $staff?->name ?? 'Unknown',
                    'services_count' => $row->services_count,
                ];
            })
            ->toArray();
    }

    private function getAverageRatingPerStaff(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        // Placeholder - integrate with ratings system when available
        return [];
    }

    private function getStaffEfficiency(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Order::query()
            ->select(DB::raw('worker_id'), DB::raw('COUNT(*) as orders_count'), DB::raw('AVG(TIMESTAMPDIFF(MINUTE, in_service_at, completed_at)) as avg_duration'))
            ->whereBetween('created_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->whereNotNull('worker_id')
            ->groupBy('worker_id');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(function ($row) {
                $staff = User::find($row->worker_id);
                return [
                    'staff_id' => $row->worker_id,
                    'staff_name' => $staff?->name ?? 'Unknown',
                    'services_per_hour' => round((60 / ($row->avg_duration ?? 30)), 2),
                ];
            })
            ->toArray();
    }

    private function getAttendanceTracking(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        // Placeholder - requires attendance tracking implementation
        return [];
    }

    // PAYMENT CALCULATIONS

    private function getPaymentMethodBreakdown(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $query = Payment::query()
            ->select(DB::raw('payment_method_id'), DB::raw('SUM(amount) as total'), DB::raw('COUNT(*) as count'))
            ->whereBetween('paid_at', [$startDate, $endDate])
            ->where('status', 'completed')
            ->groupBy('payment_method_id');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->get()
            ->map(function ($row) {
                return [
                    'payment_method_id' => $row->payment_method_id,
                    'total_amount' => round((float) $row->total, 3),
                    'transaction_count' => $row->count,
                ];
            })
            ->toArray();
    }

    private function getOutstandingPayments(?int $branchId = null): float
    {
        $query = Payment::query()
            ->where('status', 'pending');

        if ($branchId) {
            $query->where('branch_id', $branchId);
        }

        return $query->sum(DB::raw('amount')) ?? 0;
    }

    private function getProfitAnalysis(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): array
    {
        $totalRevenue = $this->getTotalRevenue($startDate, $endDate, $branchId);
        $totalTax = $this->getTotalTax($startDate, $endDate, $branchId);
        
        // Get expenses from Finance module (if available)
        $totalExpenses = $this->getTotalExpenses($startDate, $endDate, $branchId);

        return [
            'total_revenue' => round($totalRevenue, 3),
            'total_expenses' => round($totalExpenses, 3),
            'total_tax' => round($totalTax, 3),
            'gross_profit' => round($totalRevenue - $totalTax, 3),
            'net_profit' => round($totalRevenue - $totalTax - $totalExpenses, 3),
            'profit_margin' => $totalRevenue > 0 ? round((($totalRevenue - $totalTax - $totalExpenses) / $totalRevenue) * 100, 2) : 0,
        ];
    }

    private function getTotalExpenses(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        // This would connect to Expense model
        // Placeholder implementation
        return 0;
    }

    // LOYALTY CALCULATIONS

    private function getLoyaltyPointsDistributed(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): int
    {
        // Placeholder - requires loyalty points tracking
        return 0;
    }

    private function getRepeatVisitRate(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        $query = Customer::query()
            ->withCount('orders as order_count')
            ->whereHas('orders', fn ($q) => $q->whereBetween('created_at', [$startDate, $endDate]));

        if ($branchId) {
            $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
        }

        $customers = $query->get();
        $repeatCustomers = $customers->filter(fn ($c) => $c->order_count > 1)->count();
        $totalCustomers = $customers->count();

        return $totalCustomers > 0 ? ($repeatCustomers / $totalCustomers) * 100 : 0;
    }

    private function getCustomerChurnRate(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        // Customers who haven't returned in the last 90 days
        $ninetyDaysAgo = now()->subDays(90);
        $query = Customer::query()
            ->whereHas('orders', fn ($q) => $q->where('created_at', '<', $ninetyDaysAgo))
            ->whereDoesntHave('orders', fn ($q) => $q->where('created_at', '>=', $ninetyDaysAgo));

        if ($branchId) {
            $query->whereHas('orders', fn ($q) => $q->where('branch_id', $branchId));
        }

        $churnedCustomers = $query->count();
        $totalCustomers = $this->getTotalCustomers($branchId);

        return $totalCustomers > 0 ? ($churnedCustomers / $totalCustomers) * 100 : 0;
    }

    private function getRedemptionRate(?Carbon $startDate, ?Carbon $endDate, ?int $branchId = null): float
    {
        // Placeholder - requires loyalty points redemption tracking
        return 0;
    }
}
