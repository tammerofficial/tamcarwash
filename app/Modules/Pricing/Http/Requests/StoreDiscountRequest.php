<?php

namespace App\Modules\Pricing\Http\Requests;

use App\Modules\Pricing\Enums\DiscountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDiscountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageDiscounts', \App\Modules\Pricing\Models\Discount::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::enum(DiscountType::class)],
            'value' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم الخصم مطلوب.',
            'value.required' => 'قيمة الخصم مطلوبة.',
        ];
    }
}
