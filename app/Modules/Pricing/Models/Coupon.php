<?php

namespace App\Modules\Pricing\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Coupon extends Model
{
    protected $fillable = [
        'discount_id',
        'code',
        'max_uses_per_customer',
        'max_uses',
        'used_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'max_uses_per_customer' => 'integer',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function discount(): BelongsTo
    {
        return $this->belongsTo(Discount::class);
    }
}
