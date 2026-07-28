<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'booking_number' => $this->booking_number,
            'branch_id' => $this->branch_id,
            'customer_id' => $this->customer_id,
            'vehicle_id' => $this->vehicle_id,
            'time_slot_id' => $this->time_slot_id,
            'scheduled_date' => $this->scheduled_date?->toDateString(),
            'scheduled_start_time' => $this->scheduled_start_time,
            'scheduled_end_time' => $this->scheduled_end_time,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'source' => $this->source?->value,
            'source_label' => $this->source?->label(),
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'confirmed_at' => $this->confirmed_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'order_id' => $this->order_id,
            'service_ids' => $this->service_ids,
            'metadata' => $this->metadata,
            'time_slot' => TimeSlotResource::make($this->whenLoaded('timeSlot')),
            'customer_name' => $this->whenLoaded('customer', fn () => $this->customer?->name),
            'vehicle_plate' => $this->whenLoaded('vehicle', fn () => $this->vehicle?->plate_number),
            'customer' => $this->whenLoaded('customer'),
            'vehicle' => $this->whenLoaded('vehicle'),
            'branch' => $this->whenLoaded('branch'),
            'order' => $this->whenLoaded('order'),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
