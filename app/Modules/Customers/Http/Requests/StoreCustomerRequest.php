<?php

namespace App\Modules\Customers\Http\Requests;

use App\Modules\Customers\Enums\CustomerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Modules\Customers\Models\Customer::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:20', 'unique:customers,phone'],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::enum(CustomerStatus::class)],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'اسم العميل مطلوب.',
            'phone.required' => 'رقم الجوال مطلوب.',
            'phone.unique' => 'رقم الجوال مسجل مسبقاً.',
        ];
    }
}
