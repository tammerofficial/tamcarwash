<?php

namespace Database\Seeders;

use App\Modules\Finance\Models\QueueSetting;
use Illuminate\Support\Facades\Schema;

class QueueSettingsSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::hasTable('queue_settings')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'queue_settings table missing']);

            return;
        }

        $settings = QueueSetting::query()->firstOrCreate([], [
            'queue_prefix' => 'Q',
            'daily_reset_number' => 1,
            'estimated_minutes_per_vehicle' => 20,
            'announce_voice_enabled' => true,
            'show_estimated_wait' => true,
        ]);

        $this->logResult(static::class, [
            'created' => $settings->wasRecentlyCreated ? 1 : 0,
            'updated' => $settings->wasRecentlyCreated ? 0 : 1,
            'skipped' => 0,
        ]);
    }
}
