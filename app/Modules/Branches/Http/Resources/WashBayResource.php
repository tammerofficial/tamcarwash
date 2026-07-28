<?php

namespace App\Modules\Branches\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Branches\Models\WashBay */
class WashBayResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'bay_number' => $this->bay_number,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'is_active' => $this->is_active,
        ];
    }
}
