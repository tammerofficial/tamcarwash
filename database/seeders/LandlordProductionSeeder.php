<?php

namespace Database\Seeders;

use App\Models\Landlord\Plan;
use App\Support\PlanFeatureCatalog;
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
                'name' => 'Starter',
                'description' => 'مناسبة لفرع واحد ومغسلة صغيرة — 500 حجز/شهر',
                'price_monthly' => 29.00,
                'price_yearly' => 290.00,
                'currency' => 'OMR',
                'max_branches' => 1,
                'max_users' => 3,
                'max_vehicles_per_day' => 500,
                'is_active' => true,
                'sort_order' => 1,
                'features' => PlanFeatureCatalog::starterDefaults(),
            ],
            [
                'slug' => 'professional',
                'name' => 'Professional',
                'description' => 'للمغاسل متعددة الفروع — 3000 حجز/شهر',
                'price_monthly' => 59.00,
                'price_yearly' => 590.00,
                'currency' => 'OMR',
                'max_branches' => 3,
                'max_users' => 10,
                'max_vehicles_per_day' => 3000,
                'is_active' => true,
                'sort_order' => 2,
                'features' => PlanFeatureCatalog::professionalDefaults(),
            ],
            [
                'slug' => 'enterprise',
                'name' => 'Enterprise',
                'description' => 'فروع ومستخدمون وحجوزات غير محدودة',
                'price_monthly' => 99.00,
                'price_yearly' => 990.00,
                'currency' => 'OMR',
                'max_branches' => 9999,
                'max_users' => 9999,
                'max_vehicles_per_day' => null,
                'is_active' => true,
                'sort_order' => 3,
                'features' => PlanFeatureCatalog::enterpriseDefaults(),
            ],
        ];

        foreach ($plans as $plan) {
            $model = Plan::query()->updateOrCreate(['slug' => $plan['slug']], $plan);
            $model->wasRecentlyCreated ? $created++ : $updated++;
        }

        $this->callSilent(PlatformUserSeeder::class);

        $this->seedPlatformBranding($created, $updated);

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0]);
    }

    protected function seedPlatformBranding(int &$created, int &$updated): void
    {
        if (! Schema::connection('landlord')->hasTable('platform_settings')) {
            return;
        }

        $defaults = [
            'platform_name' => config('tammer.platform.name', 'تمير واش'),
            'platform_tagline' => config('tammer.platform.tagline', 'Enterprise SaaS'),
        ];

        foreach ($defaults as $key => $value) {
            $existing = \App\Models\Landlord\PlatformSetting::query()->where('key', $key)->first();

            if ($existing) {
                continue;
            }

            \App\Models\Landlord\PlatformSetting::query()->create([
                'key' => $key,
                'value' => $value,
            ]);
            $created++;
        }
    }
}
