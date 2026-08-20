<?php

namespace App\Modules\Orders\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderScreenResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'order_number' => $this->order_number,
            'queue_number' => $this->whenLoaded('queueEntry', fn () => $this->queueEntry?->queue_number),
            'vehicle_plate' => $this->whenLoaded('vehicle', fn () => $this->vehicle?->plate_number),
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'service_name' => $this->whenLoaded('items', fn () => $this->items->first()?->name),
        ];
    }
}
