<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTenantRequest extends FormRequest
{
    /** @var list<string> */
    protected array $reservedSlugs = [
        'admin', 'api', 'www', 'platform', 'landlord', 'app', 'mail', 'demo',
    ];

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
        /** @var Tenant $tenant */
        $tenant = $this->route('tenant');

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'slug' => [
                'sometimes',
                'string',
                'max:63',
                'regex:/^[a-z0-9-]+$/',
                Rule::notIn($this->reservedSlugs),
                Rule::unique(Tenant::class, 'slug')->ignore($tenant->id),
            ],
            'email' => ['sometimes', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'plan_id' => ['sometimes', 'uuid', Rule::exists(Plan::class, 'id')],
            'status' => ['sometimes', 'in:active,suspended,pending,provisioning'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex' => 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم مسبقاً.',
            'slug.not_in' => 'هذا الرابط محجوز ولا يمكن استخدامه.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'plan_id.exists' => 'الباقة المحددة غير متاحة.',
        ];
    }
}
