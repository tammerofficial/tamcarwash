<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Enums\InvoicePaymentStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Finance\Enums\PaymentStatus;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Finance\Models\Payment;
use Illuminate\Support\Facades\DB;

class PaymentService
{
    public function record(array $data): Payment
    {
        return DB::transaction(function () use ($data) {
            $payment = Payment::query()->create(array_merge($data, [
                'status' => $data['status'] ?? PaymentStatus::Completed,
                'paid_at' => $data['paid_at'] ?? now(),
            ]));

            if (! empty($data['invoice_id'])) {
                $this->syncInvoicePaymentStatus(Invoice::query()->find($data['invoice_id']));
            }

            return $payment->load('paymentMethod');
        });
    }

    public function syncInvoicePaymentStatus(?Invoice $invoice): void
    {
        if (! $invoice) {
            return;
        }

        $paid = $invoice->payments()
            ->where('status', PaymentStatus::Completed->value)
            ->sum('amount');

        $status = InvoicePaymentStatus::Unpaid;
        if ($paid >= (float) $invoice->total) {
            $status = InvoicePaymentStatus::Paid;
            $invoice->update(['status' => InvoiceStatus::Paid, 'payment_status' => $status]);
        } elseif ($paid > 0) {
            $status = InvoicePaymentStatus::Partial;
            $invoice->update(['payment_status' => $status]);
        } else {
            $invoice->update(['payment_status' => $status]);
        }
    }
}
