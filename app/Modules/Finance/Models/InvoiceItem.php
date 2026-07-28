<?php

namespace App\Modules\Finance\Models;

use App\Modules\Finance\Enums\InvoiceItemType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    protected $fillable = [
        'invoice_id',
        'item_type',
        'item_id',
        'description',
        'quantity',
        'unit_price',
        'discount_amount',
        'subtotal',
        'vat_rate',
        'vat_amount',
        'total',
        'is_tax_exempt',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'item_type' => InvoiceItemType::class,
            'quantity' => 'decimal:2',
            'unit_price' => 'decimal:3',
            'discount_amount' => 'decimal:3',
            'subtotal' => 'decimal:3',
            'vat_rate' => 'decimal:2',
            'vat_amount' => 'decimal:3',
            'total' => 'decimal:3',
            'is_tax_exempt' => 'boolean',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }
}
