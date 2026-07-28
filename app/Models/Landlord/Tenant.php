<?php

namespace App\Models\Landlord;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Tenant extends Model
{
    use HasUuids, SoftDeletes;

    protected $connection = 'landlord';

    protected $fillable = [
        'name',
        'slug',
        'legal_name',
        'tax_number',
        'email',
        'phone',
        'country',
        'timezone',
        'locale',
        'status',
        'plan_id',
        'trial_ends_at',
        'activated_at',
        'suspended_at',
        'settings',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'metadata' => 'array',
            'trial_ends_at' => 'datetime',
            'activated_at' => 'datetime',
            'suspended_at' => 'datetime',
        ];
    }

    public function domains(): HasMany
    {
        return $this->hasMany(TenantDomain::class);
    }

    public function database(): HasOne
    {
        return $this->hasOne(TenantDatabase::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    public function provisioningLogs(): HasMany
    {
        return $this->hasMany(TenantProvisioningLog::class);
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function primaryDomain(): HasOne
    {
        return $this->hasOne(TenantDomain::class)->where('is_primary', true);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isProvisioned(): bool
    {
        return $this->database?->status === 'ready';
    }
}
