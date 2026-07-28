<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Http\Resources\InvoiceResource;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Services\InvoicePdfService;
use App\Modules\Finance\Services\InvoiceService;
use App\Modules\Orders\Models\Order;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class InvoiceController extends ApiController
{
    public function __construct(
        protected InvoiceService $invoiceService,
        protected InvoicePdfService $invoicePdfService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $invoices = QueryBuilder::for(Invoice::class)
            ->allowedFilters([
                AllowedFilter::exact('branch_id'),
                AllowedFilter::exact('status'),
                AllowedFilter::exact('payment_status'),
                AllowedFilter::exact('customer_id'),
            ])
            ->allowedSorts(['issue_date', 'created_at', 'total'])
            ->with(['items', 'payments.paymentMethod'])
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedList($invoices, InvoiceResource::class);
    }

    public function show(Invoice $invoice): JsonResponse
    {
        $invoice->load(['items', 'payments.paymentMethod']);

        return $this->success(new InvoiceResource($invoice));
    }

    public function storeFromOrder(Request $request, Order $order): JsonResponse
    {
        $invoice = $this->invoiceService->createFromOrder($order, $request->user()?->id);

        return $this->success(new InvoiceResource($invoice), 'تم إنشاء الفاتورة بنجاح', 201);
    }

    public function void(Invoice $invoice): JsonResponse
    {
        if ($invoice->status->value === 'void') {
            return $this->error('الفاتورة ملغاة مسبقاً', 422, 'already_void');
        }

        $invoice = $this->invoiceService->voidInvoice($invoice);

        return $this->success(new InvoiceResource($invoice), 'تم إلغاء الفاتورة');
    }

    public function pdf(Invoice $invoice)
    {
        return $this->invoicePdfService->stream($invoice);
    }
}
