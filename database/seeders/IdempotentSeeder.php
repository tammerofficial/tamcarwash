<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

abstract class IdempotentSeeder extends Seeder
{
    protected function logResult(string $seeder, array $result): void
    {
        Log::info('[production-seed] '.$seeder, $result);
        if ($this->command) {
            $this->command->info(sprintf(
                '%s: created=%d updated=%d skipped=%d',
                $seeder,
                $result['created'] ?? 0,
                $result['updated'] ?? 0,
                $result['skipped'] ?? 0,
            ));
        }
    }
}
