<?php

namespace App\Modules\Pricing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Pricing\Models\Discount */
class DiscountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => $this->type?->value,
            'type_label' => $this->type?->label(),
            'value' => $this->value,
            'min_order_amount' => $this->min_order_amount,
            'max_uses' => $this->max_uses,
            'used_count' => $this->used_count,
            'is_active' => $this->is_active,
            'valid_from' => $this->valid_from?->toIso8601String(),
            'valid_until' => $this->valid_until?->toIso8601String(),
            'coupons' => CouponResource::collection($this->whenLoaded('coupons')),
        ];
    }
}
