<?php

namespace App\Modules\Queue\Models;

use App\Modules\Booking\Models\Booking;
use App\Modules\Orders\Models\Order;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Enums\QueueSource;
use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QueueEntry extends TenantModel
{
    protected $fillable = [
        'branch_id',
        'queue_number',
        'queue_date',
        'source',
        'booking_id',
        'order_id',
        'customer_id',
        'vehicle_id',
        'status',
        'estimated_wait_minutes',
        'priority',
        'called_at',
        'arrived_at',
        'in_service_at',
        'ready_at',
        'completed_at',
        'no_show_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'queue_date' => 'date',
            'source' => QueueSource::class,
            'status' => QueueEntryStatus::class,
            'estimated_wait_minutes' => 'integer',
            'priority' => 'integer',
            'called_at' => 'datetime',
            'arrived_at' => 'datetime',
            'in_service_at' => 'datetime',
            'ready_at' => 'datetime',
            'completed_at' => 'datetime',
            'no_show_at' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch', 'App\\Modules\\Branches\\Models\\Branch'));
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.customer', 'App\\Modules\\Customers\\Models\\Customer'));
    }

    public function vehicle(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.vehicle', 'App\\Modules\\Vehicles\\Models\\Vehicle'));
    }
}
