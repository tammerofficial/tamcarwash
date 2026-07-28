<?php

namespace Database\Seeders;

use App\Models\Landlord\PlatformUser;
use Illuminate\Support\Facades\Schema;

class PlatformUserSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::connection('landlord')->hasTable('platform_users')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'platform_users table missing']);

            return;
        }

        $user = PlatformUser::query()->updateOrCreate(
            ['email' => 'admin@tammer.test'],
            [
                'name' => 'مدير المنصة',
                'password' => 'password',
                'role' => 'admin',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->logResult(static::class, [
            'created' => $user->wasRecentlyCreated ? 1 : 0,
            'updated' => $user->wasRecentlyCreated ? 0 : 1,
            'skipped' => 0,
        ]);
    }
}
