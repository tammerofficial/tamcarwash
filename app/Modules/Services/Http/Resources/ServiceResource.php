<?php

namespace App\Modules\Services\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Services\Models\Service */
class ServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'slug' => $this->slug,
            'description' => $this->description,
            'duration_minutes' => $this->duration_minutes,
            'base_price' => $this->base_price,
            'vat_included' => $this->vat_included,
            'vat_rate' => $this->vat_rate,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'category' => ServiceCategoryResource::make($this->whenLoaded('category')),
            'addons' => ServiceAddonResource::collection($this->whenLoaded('addons')),
            'vehicle_type_prices' => ServiceVehicleTypePriceResource::collection($this->whenLoaded('vehicleTypePrices')),
            'consumables' => ServiceConsumableResource::collection($this->whenLoaded('consumables')),
            'branches' => $this->whenLoaded('branches', fn () => $this->branches->map(fn ($branch) => [
                'id' => $branch->id,
                'name' => $branch->name,
                'is_available' => (bool) $branch->pivot->is_available,
                'custom_price' => $branch->pivot->custom_price,
                'custom_duration' => $branch->pivot->custom_duration,
            ])),
        ];
    }
}
