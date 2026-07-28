<?php

namespace App\Modules\Pricing\Http\Requests;

use App\Modules\Pricing\Enums\PriceRuleType;
use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePriceRuleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('managePriceRules', \App\Modules\Pricing\Models\PriceRule::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'rule_type' => ['required', Rule::enum(PriceRuleType::class)],
            'branch_id' => ['nullable', 'integer', 'exists:branches,id'],
            'service_id' => ['nullable', 'integer', 'exists:services,id'],
            'vehicle_type' => ['nullable', Rule::enum(VehicleType::class)],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'subscription_plan_id' => ['nullable', 'integer'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'discount_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'priority' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
