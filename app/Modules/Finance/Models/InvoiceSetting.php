<?php

namespace App\Modules\Finance\Models;

use App\Models\TenantModel;

class InvoiceSetting extends TenantModel
{
    protected $fillable = [
        'invoice_prefix',
        'next_number',
        'number_padding',
        'footer_text_ar',
        'footer_text_en',
        'show_qr_code',
    ];

    protected function casts(): array
    {
        return [
            'show_qr_code' => 'boolean',
        ];
    }
}
