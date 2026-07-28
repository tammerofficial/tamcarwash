<?php

namespace App\Modules\Orders\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_id' => $this->order_id,
            'service_id' => $this->service_id,
            'addon_id' => $this->addon_id,
            'item_type' => $this->item_type?->value,
            'item_type_label' => $this->item_type?->label(),
            'name' => $this->name,
            'quantity' => $this->quantity,
            'unit_price' => (float) $this->unit_price,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_price' => (float) $this->total_price,
            'worker_id' => $this->worker_id,
            'status' => $this->status,
            'metadata' => $this->metadata,
            'worker' => $this->whenLoaded('worker'),
        ];
    }
}
