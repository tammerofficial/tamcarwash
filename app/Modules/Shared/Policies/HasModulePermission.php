<?php

namespace App\Modules\Shared\Policies;

use App\Models\User;

trait HasModulePermission
{
    protected function hasPermission(User $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
