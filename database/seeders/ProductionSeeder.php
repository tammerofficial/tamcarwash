<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

/**
 * Production deploy entry point — seeds landlord platform data, provisions demo
 * tenants, migrates tenant databases, and seeds full tenant business data.
 *
 * Forge deploy: php artisan db:seed --class=ProductionSeeder --force
 */
class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        Artisan::call('app:seed-production', [
            '--tenants' => true,
            '--force' => true,
        ]);

        if ($this->command) {
            $this->command->line(trim(Artisan::output()));
        }
    }
}
