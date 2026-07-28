<?php

namespace App\Modules\Orders\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'branch_id' => $this->branch_id,
            'customer_id' => $this->customer_id,
            'vehicle_id' => $this->vehicle_id,
            'booking_id' => $this->booking_id,
            'queue_entry_id' => $this->queue_entry_id,
            'worker_id' => $this->worker_id,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'source' => $this->source?->value,
            'source_label' => $this->source?->label(),
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'tax_amount' => (float) $this->tax_amount,
            'total_amount' => (float) $this->total_amount,
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'queued_at' => $this->queued_at?->toIso8601String(),
            'in_service_at' => $this->in_service_at?->toIso8601String(),
            'quality_check_at' => $this->quality_check_at?->toIso8601String(),
            'ready_at' => $this->ready_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'metadata' => $this->metadata,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'customer' => $this->whenLoaded('customer'),
            'vehicle' => $this->whenLoaded('vehicle'),
            'worker' => $this->whenLoaded('worker'),
            'booking' => $this->whenLoaded('booking'),
            'queue_entry' => $this->whenLoaded('queueEntry'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
