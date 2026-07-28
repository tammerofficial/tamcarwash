<?php

namespace App\Modules\Services\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Services\Models\ServiceAddon */
class ServiceAddonResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'name_ar' => $this->name_ar,
            'price' => $this->price,
            'duration_minutes' => $this->duration_minutes,
            'vat_included' => $this->vat_included,
            'is_active' => $this->is_active,
        ];
    }
}
