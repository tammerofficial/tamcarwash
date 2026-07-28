<?php

namespace App\Modules\Booking\Models;

use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TimeSlot extends TenantModel
{
    protected $fillable = [
        'branch_id',
        'slot_date',
        'start_time',
        'end_time',
        'capacity',
        'booked_count',
        'is_available',
    ];

    protected function casts(): array
    {
        return [
            'slot_date' => 'date',
            'capacity' => 'integer',
            'booked_count' => 'integer',
            'is_available' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch', 'App\\Modules\\Branches\\Models\\Branch'));
    }

    public function hasCapacity(): bool
    {
        return $this->is_available && $this->booked_count < $this->capacity;
    }

    public function remainingCapacity(): int
    {
        return max(0, $this->capacity - $this->booked_count);
    }
}
