<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Enums\ExpenseStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Finance\Enums\PaymentStatus;
use App\Modules\Finance\Models\Expense;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class TaxReportService
{
    public function daily(?int $branchId, Carbon $date): array
    {
        return $this->buildReport($branchId, $date->copy()->startOfDay(), $date->copy()->endOfDay(), 'daily');
    }

    public function monthly(?int $branchId, int $year, int $month): array
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth();
        $end = $start->copy()->endOfMonth();

        return $this->buildReport($branchId, $start, $end, 'monthly');
    }

    public function quarterly(?int $branchId, int $year, int $quarter): array
    {
        $startMonth = (($quarter - 1) * 3) + 1;
        $start = Carbon::create($year, $startMonth, 1)->startOfMonth();
        $end = $start->copy()->addMonths(2)->endOfMonth();

        return $this->buildReport($branchId, $start, $end, 'quarterly');
    }

    protected function buildReport(?int $branchId, Carbon $start, Carbon $end, string $period): array
    {
        $invoiceQuery = Invoice::query()
            ->whereBetween('issue_date', [$start->toDateString(), $end->toDateString()])
            ->where('status', '!=', InvoiceStatus::Void->value);

        if ($branchId) {
            $invoiceQuery->where('branch_id', $branchId);
        }

        $taxableSales = (clone $invoiceQuery)
            ->where('is_tax_exempt', false)
            ->sum('subtotal');

        $exemptSales = (clone $invoiceQuery)
            ->where('is_tax_exempt', true)
            ->sum('total');

        $vatCollected = (clone $invoiceQuery)->sum('vat_amount');

        $expenseQuery = Expense::query()
            ->whereBetween('expense_date', [$start->toDateString(), $end->toDateString()])
            ->whereIn('status', [ExpenseStatus::Approved->value, ExpenseStatus::Paid->value]);

        if ($branchId) {
            $expenseQuery->where('branch_id', $branchId);
        }

        $vatOnExpenses = (clone $expenseQuery)
            ->where('is_vat_recoverable', true)
            ->sum('vat_amount');

        $netVatDue = round((float) $vatCollected - (float) $vatOnExpenses, 3);

        $invoiceCount = (clone $invoiceQuery)->count();
        $paymentTotal = Payment::query()
            ->where('status', PaymentStatus::Completed->value)
            ->whereBetween('paid_at', [$start, $end])
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->sum('amount');

        return [
            'period' => $period,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
            'branch_id' => $branchId,
            'summary' => [
                'invoice_count' => $invoiceCount,
                'taxable_sales' => round((float) $taxableSales, 3),
                'exempt_sales' => round((float) $exemptSales, 3),
                'vat_collected' => round((float) $vatCollected, 3),
                'vat_on_expenses' => round((float) $vatOnExpenses, 3),
                'net_vat_due' => $netVatDue,
                'payments_received' => round((float) $paymentTotal, 3),
            ],
            'currency' => config('tammer.vat.currency', 'OMR'),
        ];
    }

    public function breakdownByDay(?int $branchId, Carbon $start, Carbon $end): array
    {
        $rows = Invoice::query()
            ->select([
                DB::raw('issue_date as date'),
                DB::raw('SUM(subtotal) as taxable_sales'),
                DB::raw('SUM(CASE WHEN is_tax_exempt = 1 THEN total ELSE 0 END) as exempt_sales'),
                DB::raw('SUM(vat_amount) as vat_collected'),
                DB::raw('COUNT(*) as invoice_count'),
            ])
            ->whereBetween('issue_date', [$start->toDateString(), $end->toDateString()])
            ->where('status', '!=', InvoiceStatus::Void->value)
            ->when($branchId, fn ($q) => $q->where('branch_id', $branchId))
            ->groupBy('issue_date')
            ->orderBy('issue_date')
            ->get();

        return $rows->map(fn ($row) => [
            'date' => $row->date,
            'invoice_count' => (int) $row->invoice_count,
            'taxable_sales' => round((float) $row->taxable_sales, 3),
            'exempt_sales' => round((float) $row->exempt_sales, 3),
            'vat_collected' => round((float) $row->vat_collected, 3),
        ])->all();
    }
}
