<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Enums\InvoiceItemType;
use App\Modules\Finance\Enums\InvoicePaymentStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Orders\Models\Order;
use Illuminate\Support\Facades\DB;

class InvoiceService
{
    public function __construct(
        protected VatCalculatorService $vatCalculator,
        protected InvoiceNumberService $invoiceNumberService,
    ) {}

    public function createFromOrder(Order $order, ?int $issuedBy = null): Invoice
    {
        return DB::transaction(function () use ($order, $issuedBy) {
            $taxSettings = TaxSetting::query()->first() ?? new TaxSetting([
                'vat_enabled' => true,
                'vat_rate' => config('tammer.vat.default_rate', 5),
                'prices_tax_inclusive' => false,
            ]);

            $order->loadMissing(['items', 'customer']);

            $lines = [];
            foreach ($order->items as $index => $item) {
                $calc = $this->vatCalculator->calculateLine(
                    (float) $item->unit_price,
                    (float) $item->quantity,
                    (float) $item->discount_amount,
                    (float) $taxSettings->vat_rate,
                    (bool) $taxSettings->prices_tax_inclusive,
                    (bool) $taxSettings->vat_enabled,
                );

                $lines[] = [
                    'item_type' => InvoiceItemType::tryFrom($item->item_type?->value ?? 'service') ?? InvoiceItemType::Service,
                    'item_id' => $item->service_id ?? $item->addon_id,
                    'description' => $item->name,
                    'quantity' => $item->quantity,
                    'unit_price' => $item->unit_price,
                    'discount_amount' => $item->discount_amount,
                    'subtotal' => $calc['subtotal'],
                    'vat_rate' => $taxSettings->vat_rate,
                    'vat_amount' => $calc['vat_amount'],
                    'total' => $calc['total'],
                    'is_tax_exempt' => ! $taxSettings->vat_enabled,
                    'sort_order' => $index,
                ];
            }

            $totals = $this->vatCalculator->calculateTotals(
                $lines,
                (bool) $taxSettings->prices_tax_inclusive,
                (bool) $taxSettings->vat_enabled,
            );

            $invoiceNumber = $this->invoiceNumberService->nextNumber();
            $qrPayload = $this->buildQrPayload($invoiceNumber, $totals['total'], $taxSettings);

            $invoice = Invoice::query()->create([
                'invoice_number' => $invoiceNumber,
                'order_id' => $order->id,
                'customer_id' => $order->customer_id,
                'branch_id' => $order->branch_id,
                'status' => InvoiceStatus::Issued,
                'payment_status' => InvoicePaymentStatus::Unpaid,
                'issue_date' => now()->toDateString(),
                'subtotal' => $totals['subtotal'],
                'discount_amount' => $order->discount_amount,
                'vat_rate' => $taxSettings->vat_rate,
                'vat_amount' => $totals['vat_amount'],
                'total' => $totals['total'],
                'is_tax_exempt' => ! $taxSettings->vat_enabled,
                'tax_inclusive' => $taxSettings->prices_tax_inclusive,
                'vatin' => $taxSettings->vatin,
                'cr_number' => $taxSettings->cr_number,
                'customer_name' => $order->customer?->name,
                'customer_phone' => $order->customer?->phone,
                'customer_email' => $order->customer?->email,
                'qr_payload' => $qrPayload,
                'issued_by' => $issuedBy,
            ]);

            foreach ($lines as $line) {
                $invoice->items()->create($line);
            }

            return $invoice->load('items');
        });
    }

    protected function buildQrPayload(string $invoiceNumber, float $total, TaxSetting $taxSettings): string
    {
        return json_encode([
            'seller' => $taxSettings->legal_name_en ?? $taxSettings->legal_name_ar ?? config('app.name'),
            'vatin' => $taxSettings->vatin,
            'cr' => $taxSettings->cr_number,
            'invoice' => $invoiceNumber,
            'total' => number_format($total, 3, '.', ''),
            'vat_rate' => (float) $taxSettings->vat_rate,
            'timestamp' => now()->toIso8601String(),
        ], JSON_UNESCAPED_UNICODE);
    }

    public function voidInvoice(Invoice $invoice): Invoice
    {
        $invoice->update(['status' => InvoiceStatus::Void]);

        return $invoice->fresh();
    }
}
