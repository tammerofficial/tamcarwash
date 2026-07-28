<?php

namespace App\Modules\Pricing\Models;

use App\Modules\Branches\Models\Branch;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeakHourPricing extends Model
{
    protected $table = 'peak_hour_pricing';

    protected $fillable = [
        'branch_id',
        'day_of_week',
        'starts_at',
        'ends_at',
        'surcharge_percent',
        'surcharge_fixed',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'day_of_week' => 'integer',
            'surcharge_percent' => 'decimal:2',
            'surcharge_fixed' => 'decimal:3',
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
