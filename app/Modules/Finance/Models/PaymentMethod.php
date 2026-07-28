<?php

namespace App\Modules\Finance\Models;

use App\Models\TenantModel;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends TenantModel
{
    protected $fillable = [
        'code',
        'name_ar',
        'name_en',
        'is_active',
        'requires_reference',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'requires_reference' => 'boolean',
        ];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
