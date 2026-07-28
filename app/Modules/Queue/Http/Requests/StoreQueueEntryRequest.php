<?php

namespace App\Modules\Queue\Http\Requests;

use App\Modules\Queue\Models\QueueEntry;
use Illuminate\Foundation\Http\FormRequest;

class StoreQueueEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', QueueEntry::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'customer_id' => ['nullable', 'integer', 'exists:customers,id'],
            'vehicle_id' => ['nullable', 'integer', 'exists:vehicles,id'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'notes' => ['nullable', 'string', 'max:500'],
            'priority' => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'الفرع مطلوب.',
        ];
    }
}
