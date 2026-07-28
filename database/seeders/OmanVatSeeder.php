<?php

namespace Database\Seeders;

use App\Modules\Finance\Models\PaymentMethod;
use App\Modules\Finance\Models\TaxSetting;
use Illuminate\Support\Facades\Schema;

class OmanVatSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        $created = 0;
        $updated = 0;

        if (Schema::hasTable('tax_settings')) {
            $tax = TaxSetting::query()->firstOrCreate([], [
                'vat_enabled' => true,
                'vat_rate' => config('tammer.vat.default_rate', 5.00),
                'prices_tax_inclusive' => false,
                'legal_name_ar' => 'مغسلة تمير للسيارات',
                'legal_name_en' => 'Tammer Car Wash',
                'address' => 'سلطنة عمان',
            ]);
            $tax->wasRecentlyCreated ? $created++ : $updated++;
        }

        if (Schema::hasTable('payment_methods')) {
            $methods = [
                ['code' => 'cash', 'name_ar' => 'نقداً', 'name_en' => 'Cash', 'requires_reference' => false, 'sort_order' => 1],
                ['code' => 'card', 'name_ar' => 'بطاقة', 'name_en' => 'Card', 'requires_reference' => true, 'sort_order' => 2],
                ['code' => 'bank_transfer', 'name_ar' => 'تحويل بنكي', 'name_en' => 'Bank Transfer', 'requires_reference' => true, 'sort_order' => 3],
                ['code' => 'wallet', 'name_ar' => 'محفظة', 'name_en' => 'Wallet', 'requires_reference' => true, 'sort_order' => 4],
            ];

            foreach ($methods as $method) {
                $model = PaymentMethod::query()->updateOrCreate(['code' => $method['code']], $method + ['is_active' => true]);
                $model->wasRecentlyCreated ? $created++ : $updated++;
            }
        }

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0]);
    }
}
