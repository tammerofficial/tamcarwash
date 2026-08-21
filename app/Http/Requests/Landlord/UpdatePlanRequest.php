<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use App\Support\PlanFeatureCatalog;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->filled('slug')) {
            $merge['slug'] = strtolower(trim((string) $this->input('slug')));
        }

        if ($this->exists('features')) {
            /** @var Plan|null $plan */
            $plan = $this->route('plan');
            $merge['features'] = PlanFeatureCatalog::normalize(
                is_array($this->input('features')) ? $this->input('features') : null,
                is_string($merge['slug'] ?? $plan?->slug) ? (string) ($merge['slug'] ?? $plan?->slug) : null,
            );
        }

        if ($merge !== []) {
            $this->merge($merge);
        }
    }

    public function rules(): array
    {
        /** @var Plan $plan */
        $plan = $this->route('plan');

        return [
            'slug' => ['sometimes', 'string', 'max:63', 'regex:/^[a-z0-9-]+$/', Rule::unique(Plan::class, 'slug')->ignore($plan->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price_monthly' => ['sometimes', 'numeric', 'min:0'],
            'price_yearly' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'max_branches' => ['nullable', 'integer', 'min:1'],
            'max_users' => ['nullable', 'integer', 'min:1'],
            'max_vehicles_per_day' => ['nullable', 'integer', 'min:1'],
            'features' => ['nullable', 'array'],
            'features.*' => ['boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
