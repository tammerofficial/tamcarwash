<?php

namespace App\Modules\Branches\Http\Requests;

use App\Modules\Branches\Enums\BranchStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateBranchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('branch')) ?? true;
    }

    public function rules(): array
    {
        $branchId = $this->route('branch')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'code' => ['sometimes', 'string', 'max:20', Rule::unique('branches', 'code')->ignore($branchId)],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::enum(BranchStatus::class)],
            'capacity_per_hour' => ['nullable', 'integer', 'min:1', 'max:100'],
            'latitude' => ['nullable', 'numeric'],
            'longitude' => ['nullable', 'numeric'],
            'is_active' => ['nullable', 'boolean'],
            'working_hours' => ['nullable', 'array'],
            'working_hours.*.day_of_week' => ['required_with:working_hours', 'integer', 'between:0,6'],
            'working_hours.*.opens_at' => ['nullable', 'date_format:H:i'],
            'working_hours.*.closes_at' => ['nullable', 'date_format:H:i'],
            'working_hours.*.is_closed' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique' => 'رمز الفرع مستخدم مسبقاً.',
        ];
    }
}
