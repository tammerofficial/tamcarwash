<?php

namespace App\Modules\Branches\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Branches\Models\WorkingHour */
class WorkingHourResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'day_of_week' => $this->day_of_week,
            'opens_at' => $this->opens_at,
            'closes_at' => $this->closes_at,
            'is_closed' => $this->is_closed,
        ];
    }
}
