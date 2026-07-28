<?php

namespace App\Modules\Finance\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceSetting extends Model
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
