<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreTenantRequest extends FormRequest
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
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:63',
                'regex:/^[a-z0-9-]+$/',
                Rule::notIn($this->reservedSlugs),
                Rule::unique(Tenant::class, 'slug'),
            ],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:20'],
            'plan_id' => ['required', 'uuid', Rule::exists(Plan::class, 'id')->where('is_active', true)],
            'status' => ['sometimes', 'in:active,suspended,pending,provisioning'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_password' => ['nullable', 'string', Password::min(8)],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم المغسلة مطلوب.',
            'slug.regex' => 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم مسبقاً.',
            'slug.not_in' => 'هذا الرابط محجوز ولا يمكن استخدامه.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني غير صالح.',
            'plan_id.required' => 'الباقة مطلوبة.',
            'plan_id.exists' => 'الباقة المحددة غير متاحة.',
            'owner_password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
        ];
    }
}
