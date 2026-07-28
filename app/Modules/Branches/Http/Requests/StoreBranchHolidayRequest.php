<?php

namespace App\Modules\Branches\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBranchHolidayRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('branch')) ?? true;
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date'],
            'name' => ['required', 'string', 'max:255'],
            'is_closed' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'date.required' => 'تاريخ العطلة مطلوب.',
            'name.required' => 'اسم العطلة مطلوب.',
        ];
    }
}
