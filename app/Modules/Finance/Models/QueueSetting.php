<?php

namespace App\Modules\Finance\Models;

use App\Models\TenantModel;

class QueueSetting extends TenantModel
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
