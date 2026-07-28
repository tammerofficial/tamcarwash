<?php

namespace App\Modules\Customers\Http\Resources;

use App\Modules\Vehicles\Http\Resources\CompanyResource;
use App\Modules\Vehicles\Http\Resources\VehicleResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Customers\Models\Customer */
class CustomerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'phone' => $this->phone,
            'email' => $this->email,
            'status' => $this->status?->value,
            'status_label' => $this->status?->label(),
            'loyalty_points_balance' => $this->loyalty_points_balance,
            'company_id' => $this->company_id,
            'company' => CompanyResource::make($this->whenLoaded('company')),
            'blacklisted_at' => $this->blacklisted_at?->toIso8601String(),
            'blacklist_reason' => $this->blacklist_reason,
            'notes' => CustomerNoteResource::collection($this->whenLoaded('notes')),
            'loyalty_points' => LoyaltyPointResource::collection($this->whenLoaded('loyaltyPoints')),
            'vehicles' => VehicleResource::collection($this->whenLoaded('vehicles')),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
