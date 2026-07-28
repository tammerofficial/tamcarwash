<?php

namespace App\Modules\Finance\Services;

use App\Modules\Finance\Models\InvoiceSetting;
use Illuminate\Support\Facades\DB;

class InvoiceNumberService
{
    public function nextNumber(): string
    {
        return DB::transaction(function () {
            $settings = InvoiceSetting::query()->lockForUpdate()->first()
                ?? InvoiceSetting::query()->create([]);

            $number = $settings->next_number;
            $padding = max(4, (int) $settings->number_padding);
            $prefix = $settings->invoice_prefix ?: 'INV';

            $settings->update(['next_number' => $number + 1]);

            return sprintf('%s-%s', $prefix, str_pad((string) $number, $padding, '0', STR_PAD_LEFT));
        });
    }
}
