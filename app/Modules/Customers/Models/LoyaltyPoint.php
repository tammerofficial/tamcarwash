<?php

namespace App\Modules\Customers\Models;

use App\Modules\Customers\Enums\LoyaltyPointType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class LoyaltyPoint extends Model
{
    protected $fillable = [
        'customer_id',
        'points',
        'type',
        'reference_type',
        'reference_id',
        'description',
        'balance_after',
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'type' => LoyaltyPointType::class,
            'reference_id' => 'integer',
            'balance_after' => 'integer',
        ];
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
