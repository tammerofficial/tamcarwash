<?php

namespace App\Modules\Branches\Models;

use App\Modules\Branches\Enums\WashBayStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WashBay extends Model
{
    protected $fillable = [
        'branch_id',
        'name',
        'bay_number',
        'status',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'bay_number' => 'integer',
            'status' => WashBayStatus::class,
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
