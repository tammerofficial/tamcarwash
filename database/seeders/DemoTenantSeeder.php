<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\App;

class DemoTenantSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! App::environment('local', 'testing')) {
            $this->logResult(static::class, [
                'created' => 0,
                'updated' => 0,
                'skipped' => 1,
                'reason' => 'DemoTenantSeeder runs only in local/testing',
            ]);

            return;
        }

        $this->call(TenantProductionSeeder::class);

        $this->logResult(static::class, [
            'created' => 0,
            'updated' => 0,
            'skipped' => 0,
            'note' => 'Demo tenant baseline seeded via TenantProductionSeeder',
        ]);
    }
}
