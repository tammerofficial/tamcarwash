<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->filled('slug')) {
            $this->merge([
                'slug' => strtolower(trim((string) $this->input('slug'))),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'slug' => ['required', 'string', 'max:63', 'regex:/^[a-z0-9-]+$/', Rule::unique(Plan::class, 'slug')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_monthly' => ['required', 'numeric', 'min:0'],
            'price_yearly' => ['required', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'max_branches' => ['nullable', 'integer', 'min:1'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_vehicles_per_day' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'features.*' => ['string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.required' => 'معرّف الباقة (Slug) مطلوب.',
            'slug.unique' => 'هذا المعرّف مستخدم مسبقاً.',
            'name.required' => 'اسم الباقة مطلوب.',
        ];
    }
}
