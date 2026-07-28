<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Services\TaxReportService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxReportController extends ApiController
{
    public function __construct(protected TaxReportService $taxReportService) {}

    public function summary(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', 'in:daily,monthly,quarterly'],
            'branch_id' => ['nullable', 'integer'],
            'date' => ['nullable', 'date'],
            'year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'quarter' => ['nullable', 'integer', 'min:1', 'max:4'],
        ]);

        $period = $validated['period'] ?? 'monthly';
        $branchId = $validated['branch_id'] ?? null;

        $report = match ($period) {
            'daily' => $this->taxReportService->daily(
                $branchId,
                isset($validated['date']) ? Carbon::parse($validated['date']) : now(),
            ),
            'quarterly' => $this->taxReportService->quarterly(
                $branchId,
                $validated['year'] ?? (int) now()->year,
                $validated['quarter'] ?? (int) ceil(now()->month / 3),
            ),
            default => $this->taxReportService->monthly(
                $branchId,
                $validated['year'] ?? (int) now()->year,
                $validated['month'] ?? (int) now()->month,
            ),
        };

        return $this->success([
            'period' => $period,
            'taxable_sales' => $report['summary']['taxable_sales'],
            'exempt_sales' => $report['summary']['exempt_sales'],
            'vat_collected' => $report['summary']['vat_collected'],
            'vat_on_expenses' => $report['summary']['vat_on_expenses'],
            'net_vat_due' => $report['summary']['net_vat_due'],
        ]);
    }

    public function daily(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['nullable', 'date'],
            'branch_id' => ['nullable', 'integer'],
        ]);

        $date = isset($validated['date']) ? Carbon::parse($validated['date']) : now();
        $report = $this->taxReportService->daily($validated['branch_id'] ?? null, $date);

        return $this->success($report);
    }

    public function monthly(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
            'month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'branch_id' => ['nullable', 'integer'],
        ]);

        $report = $this->taxReportService->monthly(
            $validated['branch_id'] ?? null,
            $validated['year'] ?? (int) now()->year,
            $validated['month'] ?? (int) now()->month,
        );

        return $this->success($report);
    }

    public function quarterly(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'year' => ['nullable', 'integer', 'min:2020', 'max:2100'],
            'quarter' => ['nullable', 'integer', 'min:1', 'max:4'],
            'branch_id' => ['nullable', 'integer'],
        ]);

        $report = $this->taxReportService->quarterly(
            $validated['branch_id'] ?? null,
            $validated['year'] ?? (int) now()->year,
            $validated['quarter'] ?? (int) ceil(now()->month / 3),
        );

        return $this->success($report);
    }

    public function breakdown(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
            'branch_id' => ['nullable', 'integer'],
        ]);

        $rows = $this->taxReportService->breakdownByDay(
            $validated['branch_id'] ?? null,
            Carbon::parse($validated['from']),
            Carbon::parse($validated['to']),
        );

        return $this->success(['items' => $rows]);
    }
}
