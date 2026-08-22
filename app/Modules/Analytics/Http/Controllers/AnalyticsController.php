<?php

namespace App\Modules\Analytics\Http\Controllers;

use App\Modules\Analytics\Services\AnalyticsService;
use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService,
    ) {}

    public function executiveSummary(Request $request): JsonResponse
    {
        $request->validate([
            'date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $date = $request->get('date') ? Carbon::parse($request->get('date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getExecutiveSummary($date, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function revenueAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getRevenueAnalytics($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function customerAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getCustomerAnalytics($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function operationsAnalytics(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getOperationsAnalytics($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function financialReports(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getFinancialReports($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function staffPerformance(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getStaffPerformance($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function loyaltyRetention(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : null;
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : null;
        $branchId = $request->get('branch_id');

        $data = $this->analyticsService->getLoyaltyRetention($startDate, $endDate, $branchId);

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function comprehensiveDashboard(Request $request): JsonResponse
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'branch_id' => 'nullable|integer|exists:branches,id',
        ]);

        $date = Carbon::now();
        $startDate = $request->get('start_date') ? Carbon::parse($request->get('start_date')) : now()->subDays(30);
        $endDate = $request->get('end_date') ? Carbon::parse($request->get('end_date')) : now();
        $branchId = $request->get('branch_id');

        $data = [
            'executive_summary' => $this->analyticsService->getExecutiveSummary($date, $branchId),
            'revenue_analytics' => $this->analyticsService->getRevenueAnalytics($startDate, $endDate, $branchId),
            'customer_analytics' => $this->analyticsService->getCustomerAnalytics($startDate, $endDate, $branchId),
            'operations_analytics' => $this->analyticsService->getOperationsAnalytics($startDate, $endDate, $branchId),
            'financial_reports' => $this->analyticsService->getFinancialReports($startDate, $endDate, $branchId),
            'staff_performance' => $this->analyticsService->getStaffPerformance($startDate, $endDate, $branchId),
            'loyalty_retention' => $this->analyticsService->getLoyaltyRetention($startDate, $endDate, $branchId),
        ];

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }
}
