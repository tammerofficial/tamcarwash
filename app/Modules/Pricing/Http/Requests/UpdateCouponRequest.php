<?php

namespace App\Modules\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('updateCoupon', $this->route('coupon')) ?? true;
    }

    public function rules(): array
    {
        $couponId = $this->route('coupon')?->id;

        return [
            'discount_id' => ['sometimes', 'integer', 'exists:discounts,id'],
            'code' => ['sometimes', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($couponId)],
            'max_uses_per_customer' => ['nullable', 'integer', 'min:1'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
