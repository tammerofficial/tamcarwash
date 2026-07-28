<?php

namespace App\Modules\Services\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateServiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('service')) ?? true;
    }

    public function rules(): array
    {
        $serviceId = $this->route('service')?->id;

        return [
            'category_id' => ['sometimes', 'integer', 'exists:service_categories,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'name_ar' => ['nullable', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('services', 'slug')->ignore($serviceId)],
            'description' => ['nullable', 'string'],
            'duration_minutes' => ['nullable', 'integer', 'min:1', 'max:480'],
            'base_price' => ['nullable', 'numeric', 'min:0'],
            'vat_included' => ['nullable', 'boolean'],
            'vat_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
            'branch_ids' => ['nullable', 'array'],
            'branch_ids.*' => ['integer', 'exists:branches,id'],
            'vehicle_type_prices' => ['nullable', 'array'],
            'vehicle_type_prices.*.vehicle_type' => ['required_with:vehicle_type_prices', 'string'],
            'vehicle_type_prices.*.price' => ['required_with:vehicle_type_prices', 'numeric', 'min:0'],
            'consumables' => ['nullable', 'array'],
            'consumables.*.name' => ['required_with:consumables', 'string', 'max:255'],
            'consumables.*.quantity' => ['nullable', 'numeric', 'min:0'],
            'consumables.*.unit' => ['nullable', 'string', 'max:50'],
        ];
    }
}
