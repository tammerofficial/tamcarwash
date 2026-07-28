<?php

namespace App\Modules\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ValidateCouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.required' => 'كود الخصم مطلوب.',
        ];
    }
}
