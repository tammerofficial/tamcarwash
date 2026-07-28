<?php

namespace App\Modules\Shared\Policies;

use App\Models\TenantUser;

trait HasModulePermission
{
    protected function hasPermission(TenantUser $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
