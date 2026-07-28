<?php

namespace App\Modules\Orders\Http\Requests;

use App\Modules\Orders\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransitionOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        $order = $this->route('order');

        return $this->user()?->can('transition', $order) ?? true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'worker_id' => ['nullable', 'integer', 'exists:users,id'],
            'queue_entry_id' => ['nullable', 'integer', 'exists:queue_entries,id'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'الحالة الجديدة مطلوبة.',
        ];
    }
}
