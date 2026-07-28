<?php

namespace Database\Seeders;

use App\Models\Landlord\Plan;
use Illuminate\Support\Facades\Schema;

class LandlordProductionSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::connection('landlord')->hasTable('plans')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'plans table missing']);

            return;
        }

        $created = 0;
        $updated = 0;

        $plans = [
            [
                'slug' => 'starter',
                'name' => 'الباقة الأساسية',
                'description' => 'مناسبة لفرع واحد ومغسلة صغيرة',
                'price_monthly' => 29.00,
                'price_yearly' => 290.00,
                'currency' => 'OMR',
                'max_branches' => 1,
                'max_users' => 5,
                'max_vehicles_per_day' => 80,
                'is_active' => true,
                'sort_order' => 1,
                'features' => ['queue', 'booking', 'invoices', 'vat_reports'],
            ],
            [
                'slug' => 'professional',
                'name' => 'الباقة الاحترافية',
                'description' => 'للمغاسل متعددة الفروع',
                'price_monthly' => 59.00,
                'price_yearly' => 590.00,
                'currency' => 'OMR',
                'max_branches' => 3,
                'max_users' => 15,
                'max_vehicles_per_day' => 250,
                'is_active' => true,
                'sort_order' => 2,
                'features' => ['queue', 'booking', 'invoices', 'vat_reports', 'analytics'],
            ],
            [
                'slug' => 'enterprise',
                'name' => 'باقة المؤسسات',
                'description' => 'للسلاسل الكبيرة',
                'price_monthly' => 99.00,
                'price_yearly' => 990.00,
                'currency' => 'OMR',
                'max_branches' => 10,
                'max_users' => 50,
                'max_vehicles_per_day' => null,
                'is_active' => true,
                'sort_order' => 3,
                'features' => ['queue', 'booking', 'invoices', 'vat_reports', 'analytics', 'api'],
            ],
        ];

        foreach ($plans as $plan) {
            $model = Plan::query()->updateOrCreate(['slug' => $plan['slug']], $plan);
            $model->wasRecentlyCreated ? $created++ : $updated++;
        }

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0]);
    }
}
