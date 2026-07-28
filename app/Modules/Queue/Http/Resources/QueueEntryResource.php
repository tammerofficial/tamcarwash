<?php

namespace App\Modules\Queue\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QueueEntryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'queue_number' => $this->queue_number,
            'queue_date' => $this->queue_date?->toDateString(),
            'source' => $this->source?->value,
            'source_label' => $this->source?->label(),
            'booking_id' => $this->booking_id,
            'order_id' => $this->order_id,
            'customer_id' => $this->customer_id,
            'vehicle_id' => $this->vehicle_id,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'estimated_wait_minutes' => $this->estimated_wait_minutes,
            'priority' => $this->priority,
            'called_at' => $this->called_at?->toIso8601String(),
            'arrived_at' => $this->arrived_at?->toIso8601String(),
            'in_service_at' => $this->in_service_at?->toIso8601String(),
            'ready_at' => $this->ready_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'no_show_at' => $this->no_show_at?->toIso8601String(),
            'notes' => $this->notes,
            'customer_name' => $this->whenLoaded('customer', fn () => $this->customer?->name),
            'vehicle_plate' => $this->whenLoaded('vehicle', fn () => $this->vehicle?->plate_number),
            'customer' => $this->whenLoaded('customer'),
            'vehicle' => $this->whenLoaded('vehicle'),
            'booking' => $this->whenLoaded('booking'),
            'order' => $this->whenLoaded('order'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
