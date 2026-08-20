<?php

namespace App\Modules\Shared\Policies;

use App\Models\TenantUser;

trait HasModulePermission
{
    protected function hasPermission(TenantUser $user, string $permission): bool
    {
        if (! method_exists($user, 'can')) {
            return false;
        }

        if ($user->can($permission)) {
            return true;
        }

        if (! str_contains($permission, '.')) {
            return false;
        }

        [$module, $action] = explode('.', $permission, 2);

        if ($action === 'view') {
            return false;
        }

        return $user->can("{$module}.manage");
    }
}
