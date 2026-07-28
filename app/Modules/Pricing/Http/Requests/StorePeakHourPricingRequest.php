<?php

namespace App\Modules\Pricing\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePeakHourPricingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('managePeakHours', \App\Modules\Pricing\Models\PeakHourPricing::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'day_of_week' => ['required', 'integer', 'between:0,6'],
            'starts_at' => ['required', 'date_format:H:i'],
            'ends_at' => ['required', 'date_format:H:i', 'after:starts_at'],
            'surcharge_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'surcharge_fixed' => ['nullable', 'numeric', 'min:0'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'الفرع مطلوب.',
            'starts_at.required' => 'وقت البداية مطلوب.',
            'ends_at.after' => 'وقت النهاية يجب أن يكون بعد وقت البداية.',
        ];
    }
}
