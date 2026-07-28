<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Http\Resources\ExpenseResource;
use App\Modules\Finance\Models\Expense;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ExpenseController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $expenses = QueryBuilder::for(Expense::class)
            ->allowedFilters(
                AllowedFilter::exact('branch_id'),
                AllowedFilter::exact('category'),
                AllowedFilter::exact('status'),
            )
            ->allowedSorts('expense_date', 'amount')
            ->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => ExpenseResource::collection($expenses)->resolve(),
            'pagination' => [
                'total' => $expenses->total(),
                'page' => $expenses->currentPage(),
                'per_page' => $expenses->perPage(),
                'total_pages' => $expenses->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'branch_id' => ['required', 'exists:branches,id'],
            'category' => ['required', 'string', 'max:64'],
            'description' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0.001'],
            'vat_amount' => ['nullable', 'numeric', 'min:0'],
            'vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'is_vat_recoverable' => ['nullable', 'boolean'],
            'expense_date' => ['required', 'date'],
            'reference_number' => ['nullable', 'string', 'max:64'],
            'vendor_name' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:pending,approved,paid,rejected'],
        ]);

        $validated['created_by'] = $request->user()?->id;
        $validated['vat_rate'] = $validated['vat_rate'] ?? config('tammer.vat.default_rate', 5);

        $expense = Expense::query()->create($validated);

        return $this->success(new ExpenseResource($expense), 'تم تسجيل المصروف', 201);
    }
}
