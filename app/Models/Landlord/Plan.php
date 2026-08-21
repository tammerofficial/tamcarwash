<?php

namespace App\Models\Landlord;

use App\Support\PlanFeatureCatalog;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Plan extends Model
{
    use HasUuids, SoftDeletes;

    protected $connection = 'landlord';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'price_monthly',
        'price_yearly',
        'currency',
        'max_branches',
        'max_users',
        'max_vehicles_per_day',
        'features',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_monthly' => 'decimal:2',
            'price_yearly' => 'decimal:2',
            'features' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * @return array<string, bool>
     */
    public function featureMap(): array
    {
        return PlanFeatureCatalog::normalize(
            is_array($this->features) ? $this->features : null,
            $this->slug,
        );
    }

    public function hasFeature(string $feature): bool
    {
        return PlanFeatureCatalog::enabled(
            is_array($this->features) ? $this->features : null,
            $feature,
            $this->slug,
        );
    }
}
