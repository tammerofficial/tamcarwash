<?php

namespace App\Modules\Orders\Models;

use App\Models\User;
use App\Modules\Booking\Models\Booking;
use App\Modules\Orders\Enums\OrderSource;
use App\Modules\Orders\Enums\OrderStatus;
use App\Modules\Queue\Models\QueueEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'order_number',
        'branch_id',
        'customer_id',
        'vehicle_id',
        'booking_id',
        'queue_entry_id',
        'worker_id',
        'status',
        'source',
        'subtotal',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'notes',
        'cancellation_reason',
        'checked_in_at',
        'queued_at',
        'in_service_at',
        'quality_check_at',
        'ready_at',
        'completed_at',
        'cancelled_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'source' => OrderSource::class,
            'subtotal' => 'decimal:3',
            'discount_amount' => 'decimal:3',
            'tax_amount' => 'decimal:3',
            'total_amount' => 'decimal:3',
            'checked_in_at' => 'datetime',
            'queued_at' => 'datetime',
            'in_service_at' => 'datetime',
            'quality_check_at' => 'datetime',
            'ready_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch', 'App\\Modules\\Branches\\Models\\Branch'));
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.customer', 'App\\Modules\\Customers\\Models\\Customer'));
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.vehicle', 'App\\Modules\\Vehicles\\Models\\Vehicle'));
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function queueEntry(): BelongsTo
    {
        return $this->belongsTo(QueueEntry::class);
    }

    public function worker(): BelongsTo
    {
        return $this->belongsTo(User::class, 'worker_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function bookingRelation(): HasOne
    {
        return $this->hasOne(Booking::class);
    }
}
