<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class WashServicesSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::hasTable('service_categories') || ! Schema::hasTable('services')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'services tables missing']);

            return;
        }

        $created = 0;
        $updated = 0;

        $categories = [
            ['slug' => 'exterior', 'name' => 'Exterior Wash', 'name_ar' => 'غسيل خارجي', 'sort_order' => 1],
            ['slug' => 'interior', 'name' => 'Interior Wash', 'name_ar' => 'غسيل داخلي', 'sort_order' => 2],
            ['slug' => 'full', 'name' => 'Full Wash', 'name_ar' => 'غسيل شامل', 'sort_order' => 3],
        ];

        $categoryIds = [];
        foreach ($categories as $category) {
            $existing = DB::table('service_categories')->where('slug', $category['slug'])->first();
            if ($existing) {
                DB::table('service_categories')->where('id', $existing->id)->update($category + ['is_active' => true, 'updated_at' => now()]);
                $categoryIds[$category['slug']] = $existing->id;
                $updated++;
            } else {
                $categoryIds[$category['slug']] = DB::table('service_categories')->insertGetId($category + [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created++;
            }
        }

        $services = [
            ['slug' => 'basic-wash', 'category' => 'exterior', 'name' => 'Basic Wash', 'name_ar' => 'غسيل أساسي', 'duration_minutes' => 15, 'base_price' => 2.500],
            ['slug' => 'premium-wash', 'category' => 'exterior', 'name' => 'Premium Wash', 'name_ar' => 'غسيل مميز', 'duration_minutes' => 25, 'base_price' => 4.500],
            ['slug' => 'interior-clean', 'category' => 'interior', 'name' => 'Interior Clean', 'name_ar' => 'تنظيف داخلي', 'duration_minutes' => 30, 'base_price' => 3.000],
            ['slug' => 'full-detail', 'category' => 'full', 'name' => 'Full Detail', 'name_ar' => 'غسيل وتلميع شامل', 'duration_minutes' => 60, 'base_price' => 8.000],
        ];

        foreach ($services as $service) {
            $payload = [
                'category_id' => $categoryIds[$service['category']],
                'name' => $service['name'],
                'name_ar' => $service['name_ar'],
                'duration_minutes' => $service['duration_minutes'],
                'base_price' => $service['base_price'],
                'vat_included' => false,
                'vat_rate' => config('tammer.vat.default_rate', 5),
                'is_active' => true,
                'updated_at' => now(),
            ];

            $existing = DB::table('services')->where('slug', $service['slug'])->first();
            if ($existing) {
                DB::table('services')->where('id', $existing->id)->update($payload);
                $updated++;
            } else {
                DB::table('services')->insert($payload + [
                    'slug' => $service['slug'],
                    'created_at' => now(),
                ]);
                $created++;
            }
        }

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0]);
    }
}
