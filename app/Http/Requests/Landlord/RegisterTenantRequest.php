<?php

namespace App\Http\Requests\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterTenantRequest extends FormRequest
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

        if ($this->filled('plan_slug')) {
            $this->merge([
                'plan_slug' => $this->normalizePlanSlug((string) $this->input('plan_slug')),
            ]);
        }
    }

    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:63',
                'regex:/^[a-z0-9-]+$/',
                Rule::notIn($this->reservedSlugs),
                Rule::unique(Tenant::class, 'slug'),
            ],
            'owner_name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'email', 'max:255'],
            'owner_password' => ['required', 'string', Password::min(8)],
            'password_confirmation' => ['required', 'same:owner_password'],
            'phone' => ['nullable', 'string', 'max:20'],
            'plan_slug' => [
                'nullable',
                'string',
                Rule::exists(Plan::class, 'slug')->where('is_active', true),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'business_name.required' => 'اسم المغسلة مطلوب.',
            'slug.regex' => 'الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط.',
            'slug.unique' => 'هذا الرابط مستخدم مسبقاً.',
            'slug.not_in' => 'هذا الرابط محجوز ولا يمكن استخدامه.',
            'owner_name.required' => 'اسم المالك مطلوب.',
            'owner_email.required' => 'البريد الإلكتروني مطلوب.',
            'owner_email.email' => 'البريد الإلكتروني غير صالح.',
            'owner_password.required' => 'كلمة المرور مطلوبة.',
            'owner_password.min' => 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.',
            'password_confirmation.same' => 'تأكيد كلمة المرور غير متطابق.',
            'plan_slug.exists' => 'الخطة المحددة غير متاحة.',
        ];
    }

    public function resolvedPlanSlug(): string
    {
        return $this->normalizePlanSlug((string) ($this->input('plan_slug') ?: 'starter'));
    }

    protected function normalizePlanSlug(string $slug): string
    {
        return match ($slug) {
            'pro' => 'professional',
            default => $slug,
        };
    }
}
