<?php

namespace App\Modules\Branches\Http\Requests;

use App\Modules\Branches\Enums\WashBayStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreWashBayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('branch')) ?? true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'bay_number' => ['required', 'integer', 'min:1'],
            'status' => ['nullable', Rule::enum(WashBayStatus::class)],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم الخط مطلوب.',
            'bay_number.required' => 'رقم الخط مطلوب.',
        ];
    }
}
