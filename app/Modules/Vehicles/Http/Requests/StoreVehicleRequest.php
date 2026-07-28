<?php

namespace App\Modules\Vehicles\Http\Requests;

use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', \App\Modules\Vehicles\Models\Vehicle::class) ?? true;
    }

    public function rules(): array
    {
        return [
            'customer_id' => ['required', 'integer', 'exists:customers,id'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'plate_number' => ['required', 'string', 'max:20', 'unique:vehicles,plate_number'],
            'brand' => ['nullable', 'string', 'max:50'],
            'model' => ['nullable', 'string', 'max:50'],
            'color' => ['nullable', 'string', 'max:30'],
            'vehicle_type' => ['nullable', Rule::enum(VehicleType::class)],
            'year' => ['nullable', 'integer', 'min:1980', 'max:2100'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function messages(): array
    {
        return [
            'customer_id.required' => 'العميل مطلوب.',
            'plate_number.required' => 'رقم اللوحة مطلوب.',
            'plate_number.unique' => 'رقم اللوحة مسجل مسبقاً.',
        ];
    }
}
