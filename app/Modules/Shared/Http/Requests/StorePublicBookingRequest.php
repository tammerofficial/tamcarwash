<?php

namespace App\Modules\Shared\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePublicBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'time_slot_id' => ['nullable', 'integer', 'exists:time_slots,id'],
            'scheduled_date' => ['required', 'date', 'after_or_equal:today'],
            'scheduled_start_time' => ['required', 'date_format:H:i'],
            'scheduled_end_time' => ['nullable', 'date_format:H:i', 'after:scheduled_start_time'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'service_ids' => ['nullable', 'array'],
            'service_ids.*' => ['integer', 'exists:services,id'],
            'customer' => ['required', 'array'],
            'customer.name' => ['required', 'string', 'max:255'],
            'customer.phone' => ['required', 'string', 'max:32'],
            'customer.email' => ['nullable', 'email', 'max:255'],
            'vehicle' => ['required', 'array'],
            'vehicle.plate_number' => ['required', 'string', 'max:32'],
            'vehicle.brand' => ['nullable', 'string', 'max:64'],
            'vehicle.model' => ['nullable', 'string', 'max:64'],
            'vehicle.color' => ['nullable', 'string', 'max:32'],
            'vehicle.vehicle_type' => ['nullable', 'string', 'max:32'],
        ];
    }

    public function messages(): array
    {
        return [
            'branch_id.required' => 'الفرع مطلوب.',
            'scheduled_date.required' => 'تاريخ الحجز مطلوب.',
            'scheduled_date.after_or_equal' => 'لا يمكن الحجز في تاريخ سابق.',
            'scheduled_start_time.required' => 'وقت البداية مطلوب.',
            'customer.name.required' => 'اسم العميل مطلوب.',
            'customer.phone.required' => 'رقم الهاتف مطلوب.',
            'vehicle.plate_number.required' => 'رقم اللوحة مطلوب.',
        ];
    }
}
