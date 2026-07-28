<?php

namespace App\Modules\Pricing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Pricing\Models\PeakHourPricing */
class PeakHourPricingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'branch_id' => $this->branch_id,
            'day_of_week' => $this->day_of_week,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'surcharge_percent' => $this->surcharge_percent,
            'surcharge_fixed' => $this->surcharge_fixed,
            'is_active' => $this->is_active,
        ];
    }
}
