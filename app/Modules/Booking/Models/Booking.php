<?php

namespace App\Modules\Booking\Models;

use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Orders\Models\Order;
use App\Modules\Queue\Models\QueueEntry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Booking extends Model
{
    protected $fillable = [
        'booking_number',
        'branch_id',
        'customer_id',
        'vehicle_id',
        'time_slot_id',
        'scheduled_date',
        'scheduled_start_time',
        'scheduled_end_time',
        'status',
        'source',
        'notes',
        'cancellation_reason',
        'confirmed_at',
        'cancelled_at',
        'completed_at',
        'order_id',
        'service_ids',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_date' => 'date',
            'status' => BookingStatus::class,
            'source' => BookingSource::class,
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'completed_at' => 'datetime',
            'service_ids' => 'array',
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

    public function timeSlot(): BelongsTo
    {
        return $this->belongsTo(TimeSlot::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function queueEntry(): HasOne
    {
        return $this->hasOne(QueueEntry::class);
    }
}
