<?php

namespace App\Modules\Queue\Policies;

use App\Models\TenantUser;
use App\Modules\Queue\Models\QueueEntry;

class QueuePolicy
{
    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.view');
    }

    public function view(TenantUser $user, QueueEntry $entry): bool
    {
        return $this->hasPermission($user, 'queue.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.create');
    }

    public function update(TenantUser $user, QueueEntry $entry): bool
    {
        return $this->hasPermission($user, 'queue.update');
    }

    public function callNext(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.call');
    }

    public function viewScreen(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.screen');
    }

    public function viewAnalytics(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.analytics');
    }

    protected function hasPermission(TenantUser $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
