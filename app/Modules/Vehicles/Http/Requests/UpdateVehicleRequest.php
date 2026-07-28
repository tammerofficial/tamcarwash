<?php

namespace App\Modules\Vehicles\Http\Requests;

use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('vehicle')) ?? true;
    }

    public function rules(): array
    {
        $vehicleId = $this->route('vehicle')?->id;

        return [
            'customer_id' => ['sometimes', 'integer', 'exists:customers,id'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'plate_number' => ['sometimes', 'string', 'max:20', Rule::unique('vehicles', 'plate_number')->ignore($vehicleId)],
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
            'plate_number.unique' => 'رقم اللوحة مسجل مسبقاً.',
        ];
    }
}
