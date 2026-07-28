<?php

namespace App\Modules\Vehicles\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Vehicles\Models\Company */
class CompanyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'contact_name' => $this->contact_name,
            'phone' => $this->phone,
            'email' => $this->email,
            'tax_number' => $this->tax_number,
            'address' => $this->address,
            'is_active' => $this->is_active,
            'vehicles_count' => $this->whenCounted('vehicles'),
            'customers_count' => $this->whenCounted('customers'),
        ];
    }
}
