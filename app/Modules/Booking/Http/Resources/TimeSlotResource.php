<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TimeSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'slot_date' => $this->slot_date?->toDateString(),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'capacity' => $this->capacity,
            'booked_count' => $this->booked_count,
            'remaining_capacity' => $this->remainingCapacity(),
            'is_available' => $this->is_available,
        ];
    }
}
