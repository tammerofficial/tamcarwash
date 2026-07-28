<?php

namespace App\Modules\Branches\Models;

use App\Modules\Branches\Enums\BranchStatus;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Services\Models\Service;
use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Branch extends TenantModel
{
    protected $fillable = [
        'name',
        'code',
        'address',
        'city',
        'phone',
        'email',
        'status',
        'capacity_per_hour',
        'latitude',
        'longitude',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'status' => BranchStatus::class,
            'capacity_per_hour' => 'integer',
            'latitude' => 'decimal:7',
            'longitude' => 'decimal:7',
            'is_active' => 'boolean',
        ];
    }

    public function workingHours(): HasMany
    {
        return $this->hasMany(WorkingHour::class);
    }

    public function holidays(): HasMany
    {
        return $this->hasMany(BranchHoliday::class);
    }

    public function washBays(): HasMany
    {
        return $this->hasMany(WashBay::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'branch_service')
            ->withPivot(['is_available', 'custom_price', 'custom_duration'])
            ->withTimestamps();
    }

    public function peakHourPricing(): HasMany
    {
        return $this->hasMany(PeakHourPricing::class);
    }

    public function activeWashBayCount(): int
    {
        return $this->washBays()->where('is_active', true)->count();
    }
}
