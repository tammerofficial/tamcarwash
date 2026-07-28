<?php

namespace App\Modules\Pricing\Models;

use App\Modules\Pricing\Enums\DiscountType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Discount extends Model
{
    protected $fillable = [
        'name',
        'type',
        'value',
        'min_order_amount',
        'max_uses',
        'used_count',
        'is_active',
        'valid_from',
        'valid_until',
    ];

    protected function casts(): array
    {
        return [
            'type' => DiscountType::class,
            'value' => 'decimal:3',
            'min_order_amount' => 'decimal:3',
            'max_uses' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
        ];
    }

    public function coupons(): HasMany
    {
        return $this->hasMany(Coupon::class);
    }
}
