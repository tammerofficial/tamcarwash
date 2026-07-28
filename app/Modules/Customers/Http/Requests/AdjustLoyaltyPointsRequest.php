<?php

namespace App\Modules\Customers\Http\Requests;

use App\Modules\Customers\Enums\LoyaltyPointType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdjustLoyaltyPointsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manageLoyalty', $this->route('customer')) ?? true;
    }

    public function rules(): array
    {
        return [
            'points' => ['required', 'integer', 'not_in:0'],
            'type' => ['required', Rule::enum(LoyaltyPointType::class)],
            'description' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'points.required' => 'عدد النقاط مطلوب.',
            'type.required' => 'نوع العملية مطلوب.',
        ];
    }
}
