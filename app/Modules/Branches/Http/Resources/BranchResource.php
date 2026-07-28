<?php

namespace App\Modules\Branches\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Branches\Models\Branch */
class BranchResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'code' => $this->code,
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'email' => $this->email,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'capacity_per_hour' => $this->capacity_per_hour,
            'capacity' => $this->capacity_per_hour,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_active' => $this->is_active,
            'working_hours' => WorkingHourResource::collection($this->whenLoaded('workingHours')),
            'holidays' => BranchHolidayResource::collection($this->whenLoaded('holidays')),
            'wash_bays' => WashBayResource::collection($this->whenLoaded('washBays')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
