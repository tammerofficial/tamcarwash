<?php

namespace App\Modules\Customers\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCustomerNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('customer')) ?? true;
    }

    public function rules(): array
    {
        return [
            'note' => ['required', 'string', 'max:2000'],
            'is_pinned' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'note.required' => 'نص الملاحظة مطلوب.',
        ];
    }
}
