<?php

namespace App\Modules\Finance\Models;

use App\Models\User;
use App\Modules\Finance\Enums\ExpenseStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends Model
{
    protected $fillable = [
        'branch_id',
        'category',
        'description',
        'amount',
        'vat_amount',
        'vat_rate',
        'is_vat_recoverable',
        'expense_date',
        'reference_number',
        'vendor_name',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'status' => ExpenseStatus::class,
            'amount' => 'decimal:3',
            'vat_amount' => 'decimal:3',
            'vat_rate' => 'decimal:2',
            'is_vat_recoverable' => 'boolean',
            'expense_date' => 'date',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(config('tammer.models.branch'));
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
