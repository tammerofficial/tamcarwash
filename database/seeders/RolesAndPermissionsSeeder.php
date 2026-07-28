<?php

namespace Database\Seeders;

use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends IdempotentSeeder
{
    public function run(): void
    {
        if (! Schema::hasTable('permissions')) {
            $this->logResult(static::class, ['created' => 0, 'updated' => 0, 'skipped' => 1, 'reason' => 'permission tables missing']);

            return;
        }

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = config('tammer.permissions', []);
        $created = 0;
        $updated = 0;

        $guard = 'tenant';

        foreach ($permissions as $permission) {
            $model = Permission::query()->firstOrCreate([
                'name' => $permission,
                'guard_name' => $guard,
            ]);
            $model->wasRecentlyCreated ? $created++ : $updated++;
        }

        $roleMap = config('tammer.roles', []);
        foreach ($roleMap as $roleName => $rolePermissions) {
            $role = Role::query()->firstOrCreate([
                'name' => $roleName,
                'guard_name' => $guard,
            ]);

            if ($rolePermissions === ['*']) {
                $role->syncPermissions(Permission::all());
            } else {
                $role->syncPermissions($rolePermissions);
            }
        }

        $this->logResult(static::class, compact('created', 'updated') + ['skipped' => 0, 'roles' => array_keys($roleMap)]);
    }
}
