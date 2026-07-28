<?php

namespace App\Modules\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageCoupons', \App\Modules\Pricing\Models\Coupon::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'discount_id' => ['required', 'integer', 'exists:discounts,id'],
            'code' => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'max_uses_per_customer' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'كود الخصم مستخدم مسبقاً.',
        ];
    }
}
