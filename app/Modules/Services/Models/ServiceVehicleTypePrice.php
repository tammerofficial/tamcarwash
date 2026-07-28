<?php

namespace App\Modules\Services\Models;

use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceVehicleTypePrice extends Model
{
    protected $fillable = [
        'service_id',
        'vehicle_type',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'vehicle_type' => VehicleType::class,
            'price' => 'decimal:3',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
