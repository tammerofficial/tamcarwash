<?php

namespace App\Modules\Services\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Services\Models\ServiceVehicleTypePrice */
class ServiceVehicleTypePriceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle_type' => $this->vehicle_type?->value,
            'vehicle_type_label' => $this->vehicle_type?->label(),
            'price' => $this->price,
        ];
    }
}
