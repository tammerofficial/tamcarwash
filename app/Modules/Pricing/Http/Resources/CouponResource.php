<?php

namespace App\Modules\Pricing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Pricing\Models\Coupon */
class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'discount_id' => $this->discount_id,
            'code' => $this->code,
            'max_uses_per_customer' => $this->max_uses_per_customer,
            'max_uses' => $this->max_uses,
            'used_count' => $this->used_count,
            'is_active' => $this->is_active,
            'discount' => DiscountResource::make($this->whenLoaded('discount')),
        ];
    }
}
