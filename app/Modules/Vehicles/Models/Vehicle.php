<?php

namespace App\Modules\Vehicles\Models;

use App\Modules\Customers\Models\Customer;
use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    protected $fillable = [
        'customer_id',
        'company_id',
        'plate_number',
        'brand',
        'model',
        'color',
        'vehicle_type',
        'year',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'vehicle_type' => VehicleType::class,
            'year' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
