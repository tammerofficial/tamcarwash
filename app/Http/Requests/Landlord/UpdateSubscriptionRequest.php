<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['sometimes', 'in:active,trial,past_due,cancelled,expired'],
            'plan_id' => ['sometimes', 'uuid', Rule::exists(Plan::class, 'id')],
            'billing_cycle' => ['sometimes', 'in:monthly,yearly'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['nullable', 'date'],
            'amount' => ['sometimes', 'numeric', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'plan_id.exists' => 'الباقة المحددة غير متاحة.',
            'status.in' => 'حالة الاشتراك غير صالحة.',
        ];
    }
}
