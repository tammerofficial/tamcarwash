<?php

namespace App\Modules\Queue\Policies;

use App\Models\User;
use App\Modules\Queue\Models\QueueEntry;

class QueuePolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'queue.view');
    }

    public function view(User $user, QueueEntry $entry): bool
    {
        return $this->hasPermission($user, 'queue.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'queue.create');
    }

    public function update(User $user, QueueEntry $entry): bool
    {
        return $this->hasPermission($user, 'queue.update');
    }

    public function callNext(User $user): bool
    {
        return $this->hasPermission($user, 'queue.call');
    }

    public function viewScreen(User $user): bool
    {
        return $this->hasPermission($user, 'queue.screen');
    }

    public function viewAnalytics(User $user): bool
    {
        return $this->hasPermission($user, 'queue.analytics');
    }

    protected function hasPermission(User $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
