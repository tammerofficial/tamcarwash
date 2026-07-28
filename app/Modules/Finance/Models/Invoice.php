<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Finance\Enums\InvoicePaymentStatus;
use App\Modules\Finance\Enums\InvoiceStatus;
use App\Modules\Orders\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    protected $fillable = [
        'invoice_number',
        'order_id',
        'customer_id',
        'branch_id',
        'status',
        'payment_status',
        'issue_date',
        'due_date',
        'subtotal',
        'discount_amount',
        'vat_rate',
        'vat_amount',
        'total',
        'is_tax_exempt',
        'tax_inclusive',
        'vatin',
        'cr_number',
        'customer_name',
        'customer_phone',
        'customer_email',
        'qr_payload',
        'notes',
        'issued_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => InvoiceStatus::class,
            'payment_status' => InvoicePaymentStatus::class,
            'issue_date' => 'date',
            'due_date' => 'date',
            'subtotal' => 'decimal:3',
            'discount_amount' => 'decimal:3',
            'vat_rate' => 'decimal:2',
            'vat_amount' => 'decimal:3',
            'total' => 'decimal:3',
            'is_tax_exempt' => 'boolean',
            'tax_inclusive' => 'boolean',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.customer'));
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch'));
    }

    public function issuer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class)->orderBy('sort_order');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
