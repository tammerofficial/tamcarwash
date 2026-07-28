<?php

namespace App\Modules\Branches\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchHoliday extends Model
{
    protected $fillable = [
        'branch_id',
        'date',
        'name',
        'is_closed',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'is_closed' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
