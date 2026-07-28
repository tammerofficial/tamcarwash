<?php

namespace App\Modules\Orders\Models;

use App\Models\User;
use App\Modules\Orders\Enums\OrderItemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'service_id',
        'addon_id',
        'item_type',
        'name',
        'quantity',
        'unit_price',
        'discount_amount',
        'tax_amount',
        'total_price',
        'worker_id',
        'status',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'item_type' => OrderItemType::class,
            'quantity' => 'integer',
            'unit_price' => 'decimal:3',
            'discount_amount' => 'decimal:3',
            'tax_amount' => 'decimal:3',
            'total_price' => 'decimal:3',
            'metadata' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }
}
