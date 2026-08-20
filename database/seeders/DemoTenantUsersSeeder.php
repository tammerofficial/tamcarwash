<?php

namespace Database\Seeders;

use App\Models\TenantUser;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DemoTenantUsersSeeder extends IdempotentSeeder
{
    private const PASSWORD = 'password';

    /** @var array<int, array{email: string, name: string, role: string}> */
    private const DEMO_USERS = [
        ['email' => 'owner@demo.test', 'name' => 'مالك تجريبي', 'role' => 'owner'],
        ['email' => 'manager@demo.test', 'name' => 'مدير تجريبي', 'role' => 'manager'],
        ['email' => 'cashier@demo.test', 'name' => 'كاشير تجريبي', 'role' => 'cashier'],
        ['email' => 'worker@demo.test', 'name' => 'أحمد البلوشي', 'role' => 'worker'],
    ];

    public function run(): void
    {
        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach (self::DEMO_USERS as $spec) {
            $user = TenantUser::query()->updateOrCreate(
                ['email' => $spec['email']],
                [
                    'name' => $spec['name'],
                    'password' => Hash::make(self::PASSWORD),
                    'email_verified_at' => now(),
                ]
            );

            $user->wasRecentlyCreated ? $created++ : $updated++;

            $role = Role::query()
                ->where('name', $spec['role'])
                ->where('guard_name', 'tenant')
                ->first();

            if (! $role) {
                $skipped++;

                continue;
            }

            $user->syncRoles([$role]);
        }

        $this->logResult(static::class, compact('created', 'updated', 'skipped'));
    }
}
