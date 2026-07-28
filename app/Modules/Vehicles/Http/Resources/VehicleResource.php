<?php

namespace App\Modules\Vehicles\Http\Resources;

use App\Modules\Customers\Http\Resources\CustomerResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Vehicles\Models\Vehicle */
class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'company_id' => $this->company_id,
            'plate_number' => $this->plate_number,
            'brand' => $this->brand,
            'model' => $this->model,
            'color' => $this->color,
            'vehicle_type' => $this->vehicle_type?->value,
            'vehicle_type_label' => $this->vehicle_type?->label(),
            'year' => $this->year,
            'is_active' => $this->is_active,
            'customer' => CustomerResource::make($this->whenLoaded('customer')),
            'company' => CompanyResource::make($this->whenLoaded('company')),
        ];
    }
}
