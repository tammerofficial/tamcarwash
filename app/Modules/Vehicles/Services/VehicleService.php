<?php

namespace App\Modules\Vehicles\Services;

use App\Modules\Vehicles\Enums\VehicleType;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;
use Illuminate\Support\Facades\DB;

class VehicleService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createCompany(array $data): Company
    {
        return Company::query()->create([
            'name' => $data['name'],
            'contact_name' => $data['contact_name'] ?? null,
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'tax_number' => $data['tax_number'] ?? null,
            'address' => $data['address'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateCompany(Company $company, array $data): Company
    {
        $company->update(collect($data)->only([
            'name', 'contact_name', 'phone', 'email', 'tax_number', 'address', 'is_active',
        ])->filter(fn ($v) => $v !== null)->all());

        return $company->fresh(['vehicles', 'customers']);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Vehicle
    {
        return DB::transaction(function () use ($data) {
            return Vehicle::query()->create([
                'customer_id' => $data['customer_id'],
                'company_id' => $data['company_id'] ?? null,
                'plate_number' => strtoupper($data['plate_number']),
                'brand' => $data['brand'] ?? null,
                'model' => $data['model'] ?? null,
                'color' => $data['color'] ?? null,
                'vehicle_type' => $data['vehicle_type'] ?? VehicleType::Sedan,
                'year' => $data['year'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        if (isset($data['plate_number'])) {
            $data['plate_number'] = strtoupper($data['plate_number']);
        }

        $vehicle->update(collect($data)->only([
            'customer_id', 'company_id', 'plate_number', 'brand', 'model',
            'color', 'vehicle_type', 'year', 'is_active',
        ])->filter(fn ($v) => $v !== null)->all());

        return $vehicle->fresh(['customer', 'company']);
    }
}
