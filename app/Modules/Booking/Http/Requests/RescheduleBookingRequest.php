<?php

namespace App\Modules\Booking\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RescheduleBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $booking = $this->route('booking');

        return $this->user()?->can('reschedule', $booking) ?? true;
    }

    public function rules(): array
    {
        return [
            'scheduled_date' => ['nullable', 'date', 'after_or_equal:today'],
            'scheduled_start_time' => ['nullable', 'date_format:H:i'],
            'scheduled_end_time' => ['nullable', 'date_format:H:i'],
            'time_slot_id' => ['nullable', 'integer', 'exists:time_slots,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'scheduled_date.after_or_equal' => 'لا يمكن إعادة الجدولة لتاريخ سابق.',
        ];
    }
}
