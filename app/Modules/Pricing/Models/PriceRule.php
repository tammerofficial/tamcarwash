<?php

namespace App\Modules\Pricing\Models;

use App\Modules\Branches\Models\Branch;
use App\Modules\Pricing\Enums\PriceRuleType;
use App\Modules\Services\Models\Service;
use App\Modules\Vehicles\Enums\VehicleType;
use App\Modules\Vehicles\Models\Company;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceRule extends Model
{
    protected $fillable = [
        'name',
        'rule_type',
        'branch_id',
        'service_id',
        'vehicle_type',
        'company_id',
        'subscription_plan_id',
        'price',
        'discount_percent',
        'priority',
        'is_active',
        'valid_from',
        'valid_until',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'rule_type' => PriceRuleType::class,
            'vehicle_type' => VehicleType::class,
            'subscription_plan_id' => 'integer',
            'price' => 'decimal:3',
            'discount_percent' => 'decimal:2',
            'priority' => 'integer',
            'is_active' => 'boolean',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}
