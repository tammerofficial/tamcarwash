<?php

namespace App\Modules\Pricing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Pricing\Models\PriceRule */
class PriceRuleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'rule_type' => $this->rule_type?->value,
            'rule_type_label' => $this->rule_type?->label(),
            'branch_id' => $this->branch_id,
            'service_id' => $this->service_id,
            'vehicle_type' => $this->vehicle_type?->value,
            'company_id' => $this->company_id,
            'subscription_plan_id' => $this->subscription_plan_id,
            'price' => $this->price,
            'discount_percent' => $this->discount_percent,
            'priority' => $this->priority,
            'is_active' => $this->is_active,
            'valid_from' => $this->valid_from?->toIso8601String(),
            'valid_until' => $this->valid_until?->toIso8601String(),
            'metadata' => $this->metadata,
        ];
    }
}
