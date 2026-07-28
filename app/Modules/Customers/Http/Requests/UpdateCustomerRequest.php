<?php

namespace App\Modules\Customers\Http\Requests;

use App\Modules\Customers\Enums\CustomerStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCustomerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('customer')) ?? true;
    }

    public function rules(): array
    {
        $customerId = $this->route('customer')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:20', Rule::unique('customers', 'phone')->ignore($customerId)],
            'email' => ['nullable', 'email', 'max:255'],
            'status' => ['nullable', Rule::enum(CustomerStatus::class)],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'phone.unique' => 'رقم الجوال مسجل مسبقاً.',
        ];
    }
}
