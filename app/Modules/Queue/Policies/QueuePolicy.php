<?php

namespace App\Modules\Queue\Policies;

use App\Models\TenantUser;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Shared\Policies\HasModulePermission;

class QueuePolicy
{
    use HasModulePermission;

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
        return $this->hasPermission($user, 'queue.manage');
    }

    public function update(TenantUser $user, QueueEntry $entry): bool
    {
        return $this->hasPermission($user, 'queue.manage');
    }

    public function callNext(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.manage');
    }

    public function viewScreen(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.view');
    }

    public function viewAnalytics(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'queue.manage');
    }
}
