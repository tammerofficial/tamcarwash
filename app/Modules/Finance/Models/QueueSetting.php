<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;

class QueueSetting extends Model
{
    protected $fillable = [
        'queue_prefix',
        'daily_reset_number',
        'estimated_minutes_per_vehicle',
        'announce_voice_enabled',
        'show_estimated_wait',
    ];

    protected function casts(): array
    {
        return [
            'announce_voice_enabled' => 'boolean',
            'show_estimated_wait' => 'boolean',
        ];
    }
}
