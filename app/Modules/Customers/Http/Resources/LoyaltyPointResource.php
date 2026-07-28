<?php

namespace App\Modules\Customers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Customers\Models\LoyaltyPoint */
class LoyaltyPointResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'points' => $this->points,
            'type' => $this->type?->value,
            'type_label' => $this->type?->label(),
            'description' => $this->description,
            'balance_after' => $this->balance_after,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
