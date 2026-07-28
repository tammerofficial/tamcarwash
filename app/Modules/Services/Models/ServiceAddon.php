<?php

namespace App\Modules\Services\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAddon extends Model
{
    protected $fillable = [
        'service_id',
        'name',
        'name_ar',
        'price',
        'duration_minutes',
        'vat_included',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:3',
            'duration_minutes' => 'integer',
            'vat_included' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(Service::class);
    }
}
