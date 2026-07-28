<?php

namespace App\Modules\Finance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'category' => $this->category,
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'vat_amount' => (float) $this->vat_amount,
            'vat_rate' => (float) $this->vat_rate,
            'is_vat_recoverable' => $this->is_vat_recoverable,
            'expense_date' => $this->expense_date?->toDateString(),
            'reference_number' => $this->reference_number,
            'vendor_name' => $this->vendor_name,
            'status' => $this->status?->value,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
