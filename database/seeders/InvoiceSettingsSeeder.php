<?php

namespace Database\Seeders;

use App\Modules\Finance\Models\InvoiceSetting;
use Illuminate\Support\Facades\Schema;

class InvoiceSettingsSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::hasTable('invoice_settings')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'invoice_settings table missing']);

            return;
        }

        $settings = InvoiceSetting::query()->firstOrCreate([], [
            'invoice_prefix' => 'INV',
            'next_number' => 1,
            'number_padding' => 6,
            'footer_text_ar' => 'شكراً لتعاملكم مع مغسلة تمير — فاتورة ضريبية معتمدة في سلطنة عمان',
            'footer_text_en' => 'Thank you for choosing Tammer Wash — Oman compliant tax invoice',
            'show_qr_code' => true,
        ]);

        $this->logResult(static::class, [
            'created' => $settings->wasRecentlyCreated ? 1 : 0,
            'updated' => $settings->wasRecentlyCreated ? 0 : 1,
            'skipped' => 0,
        ]);
    }
}
