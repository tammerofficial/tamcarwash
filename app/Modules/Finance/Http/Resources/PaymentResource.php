<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_id' => $this->invoice_id,
            'order_id' => $this->order_id,
            'payment_method_id' => $this->payment_method_id,
            'payment_method' => $this->whenLoaded('paymentMethod', fn () => [
                'code' => $this->paymentMethod->code,
                'name_ar' => $this->paymentMethod->name_ar,
                'name_en' => $this->paymentMethod->name_en,
            ]),
            'branch_id' => $this->branch_id,
            'amount' => (float) $this->amount,
            'reference_number' => $this->reference_number,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'status' => $this->status?->value,
            'notes' => $this->notes,
        ];
    }
}
