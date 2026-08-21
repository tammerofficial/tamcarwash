<?php

namespace Database\Seeders;

use App\Models\Landlord\PlatformUser;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class PlatformUserSeeder extends IdempotentSeeder
{
    private const DEMO_EMAIL = 'admin@tammer.test';

    private const DEMO_PASSWORD = 'password';

    private const DEMO_NAME = 'مدير المنصة';

    private const DEMO_ROLE = 'admin';

    public function run(): void
    {
        if (! Schema::connection('landlord')->hasTable('platform_users')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'platform_users table missing']);

            return;
        }

        $credentials = $this->resolveCredentials();
        if ($credentials === null) {
            return;
        }

        $user = PlatformUser::query()->updateOrCreate(
            ['email' => $credentials['email']],
            [
                'name' => $credentials['name'],
                'password' => $credentials['password'],
                'role' => $credentials['role'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->logResult(static::class, [
            'created' => $user->wasRecentlyCreated ? 1 : 0,
            'updated' => $user->wasRecentlyCreated ? 0 : 1,
            'skipped' => 0,
            'email' => $credentials['email'],
        ]);
    }

    /**
     * @return array{email: string, password: string, name: string, role: string}|null
     */
    protected function resolveCredentials(): ?array
    {
        $email = config('tenancy.landlord_admin.email');
        $password = config('tenancy.landlord_admin.password');
        $name = config('tenancy.landlord_admin.name', self::DEMO_NAME);
        $role = config('tenancy.landlord_admin.role', self::DEMO_ROLE);

        if ($email && $password) {
            return compact('email', 'password', 'name', 'role');
        }

        if (app()->environment('production')) {
            if (PlatformUser::query()->where('is_active', true)->exists()) {
                Log::info('[production-seed] PlatformUserSeeder skipped — set LANDLORD_ADMIN_EMAIL and LANDLORD_ADMIN_PASSWORD in Forge env to manage super admin');
                $this->logResult(static::class, [
                    'created' => 0,
                    'updated' => 0,
                    'skipped' => 1,
                    'reason' => 'production credentials not configured',
                ]);

                return null;
            }

            Log::warning('[production-seed] PlatformUserSeeder using demo defaults for first bootstrap — set LANDLORD_ADMIN_* in Forge env before go-live');

            return [
                'email' => self::DEMO_EMAIL,
                'password' => self::DEMO_PASSWORD,
                'name' => self::DEMO_NAME,
                'role' => self::DEMO_ROLE,
            ];
        }

        return [
            'email' => $email ?: self::DEMO_EMAIL,
            'password' => $password ?: self::DEMO_PASSWORD,
            'name' => $name,
            'role' => $role,
        ];
    }
}
