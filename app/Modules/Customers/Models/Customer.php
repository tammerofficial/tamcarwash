<?php

namespace App\Modules\Customers\Models;

use App\Modules\Customers\Enums\CustomerStatus;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'name',
        'phone',
        'email',
        'status',
        'loyalty_points_balance',
        'company_id',
        'blacklisted_at',
        'blacklist_reason',
    ];

    protected function casts(): array
    {
        return [
            'status' => CustomerStatus::class,
            'loyalty_points_balance' => 'integer',
            'blacklisted_at' => 'datetime',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function notes(): HasMany
    {
        return $this->hasMany(CustomerNote::class);
    }

    public function loyaltyPoints(): HasMany
    {
        return $this->hasMany(LoyaltyPoint::class);
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class);
    }

    public function isBlacklisted(): bool
    {
        return $this->status === CustomerStatus::Blacklisted;
    }
}
