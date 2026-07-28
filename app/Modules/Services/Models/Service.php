<?php

namespace App\Modules\Services\Models;

use App\Modules\Branches\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Service extends Model
{
    protected $fillable = [
        'category_id',
        'name',
        'name_ar',
        'slug',
        'description',
        'duration_minutes',
        'base_price',
        'vat_included',
        'vat_rate',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'duration_minutes' => 'integer',
            'base_price' => 'decimal:3',
            'vat_included' => 'boolean',
            'vat_rate' => 'decimal:2',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServiceCategory::class, 'category_id');
    }

    public function addons(): HasMany
    {
        return $this->hasMany(ServiceAddon::class);
    }

    public function vehicleTypePrices(): HasMany
    {
        return $this->hasMany(ServiceVehicleTypePrice::class);
    }

    public function consumables(): HasMany
    {
        return $this->hasMany(ServiceConsumable::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class, 'branch_service')
            ->withPivot(['is_available', 'custom_price', 'custom_duration'])
            ->withTimestamps();
    }
}
