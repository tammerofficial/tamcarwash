<?php

namespace App\Modules\Booking\Http\Requests;

use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Booking::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'vehicle_id' => ['required', 'integer', 'exists:vehicles,id'],
            'time_slot_id' => ['nullable', 'integer', 'exists:time_slots,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'scheduled_start_time' => ['required', 'date_format:H:i'],
            'scheduled_end_time' => ['nullable', 'date_format:H:i', 'after:scheduled_start_time'],
            'source' => ['nullable', Rule::enum(BookingSource::class)],
            'notes' => ['nullable', 'string', 'max:1000'],
            'service_ids' => ['nullable', 'array'],
            'service_ids.*' => ['integer'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'الفرع مطلوب.',
            'customer_id.required' => 'العميل مطلوب.',
            'vehicle_id.required' => 'المركبة مطلوبة.',
            'scheduled_date.required' => 'تاريخ الحجز مطلوب.',
            'scheduled_date.after_or_equal' => 'لا يمكن الحجز في تاريخ سابق.',
            'scheduled_start_time.required' => 'وقت البداية مطلوب.',
        ];
    }
}
