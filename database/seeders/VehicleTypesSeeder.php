<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class VehicleTypesSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::hasTable('vehicle_types')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'vehicle_types table missing']);

            return;
        }

        $created = 0;
        $updated = 0;

        $types = [
            ['code' => 'sedan', 'name_ar' => 'سيدان', 'name_en' => 'Sedan', 'sort_order' => 1],
            ['code' => 'suv', 'name_ar' => 'دفع رباعي', 'name_en' => 'SUV', 'sort_order' => 2],
            ['code' => 'pickup', 'name_ar' => 'بيك أب', 'name_en' => 'Pickup', 'sort_order' => 3],
            ['code' => 'van', 'name_ar' => 'فان', 'name_en' => 'Van', 'sort_order' => 4],
            ['code' => 'luxury', 'name_ar' => 'فاخرة', 'name_en' => 'Luxury', 'sort_order' => 5],
        ];

        foreach ($types as $type) {
            $existing = DB::table('vehicle_types')->where('code', $type['code'])->first();
            if ($existing) {
                DB::table('vehicle_types')->where('id', $existing->id)->update($type + ['is_active' => true, 'updated_at' => now()]);
                $updated++;
            } else {
                DB::table('vehicle_types')->insert($type + [
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $created++;
            }
        }

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0]);
    }
}
