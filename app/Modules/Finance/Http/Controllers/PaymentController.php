<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Http\Resources\PaymentResource;
use App\Modules\Finance\Models\Payment;
use App\Modules\Finance\Services\PaymentService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PaymentController extends ApiController
{
    public function __construct(protected PaymentService $paymentService) {}

    public function index(Request $request): JsonResponse
    {
        $payments = QueryBuilder::for(Payment::class)
            ->allowedFilters([
                AllowedFilter::exact('branch_id'),
                AllowedFilter::exact('invoice_id'),
                AllowedFilter::exact('status'),
            ])
            ->allowedSorts(['paid_at', 'amount'])
            ->with('paymentMethod')
            ->paginate($request->integer('per_page', 20));

        return $this->success([
            'items' => PaymentResource::collection($payments)->resolve(),
            'pagination' => [
                'total' => $payments->total(),
                'page' => $payments->currentPage(),
                'per_page' => $payments->perPage(),
                'total_pages' => $payments->lastPage(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'order_id' => ['nullable', 'exists:orders,id'],
            'payment_method_id' => ['required', 'exists:payment_methods,id'],
            'branch_id' => ['required', 'exists:branches,id'],
            'amount' => ['required', 'numeric', 'min:0.001'],
            'reference_number' => ['nullable', 'string', 'max:64'],
            'paid_at' => ['nullable', 'date'],
            'cash_drawer_session_id' => ['nullable', 'exists:cash_drawer_sessions,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['received_by'] = $request->user()?->id;
        $payment = $this->paymentService->record($validated);

        return $this->success(new PaymentResource($payment), 'تم تسجيل الدفعة بنجاح', 201);
    }
}
