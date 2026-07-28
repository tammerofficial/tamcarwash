<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Finance\Enums\CashDrawerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashDrawerSession extends Model
{
    protected $fillable = [
        'branch_id',
        'user_id',
        'opened_at',
        'closed_at',
        'opening_balance',
        'closing_balance',
        'expected_balance',
        'difference',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => CashDrawerStatus::class,
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'opening_balance' => 'decimal:3',
            'closing_balance' => 'decimal:3',
            'expected_balance' => 'decimal:3',
            'difference' => 'decimal:3',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch'));
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
