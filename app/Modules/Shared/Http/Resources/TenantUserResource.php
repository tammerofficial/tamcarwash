<?php

namespace App\Modules\Shared\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\TenantUser */
class TenantUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'roles' => method_exists($this->resource, 'getRoleNames')
                ? $this->resource->getRoleNames()->values()->all()
                : [],
        ];
    }
}
