<?php

namespace App\Modules\Services\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Services\Models\ServiceCategory */
class ServiceCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'slug' => $this->slug,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'services' => ServiceResource::collection($this->whenLoaded('services')),
        ];
    }
}
