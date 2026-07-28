<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;

class TaxSetting extends Model
{
    protected $fillable = [
        'vat_enabled',
        'vat_rate',
        'prices_tax_inclusive',
        'vatin',
        'cr_number',
        'legal_name_ar',
        'legal_name_en',
        'address',
    ];

    protected function casts(): array
    {
        return [
            'vat_enabled' => 'boolean',
            'vat_rate' => 'decimal:2',
            'prices_tax_inclusive' => 'boolean',
        ];
    }
}
