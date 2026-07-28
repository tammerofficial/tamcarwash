<?php

namespace App\Modules\Branches\Policies;

use App\Models\User;
use App\Modules\Branches\Models\Branch;
use App\Modules\Shared\Policies\HasModulePermission;

class BranchPolicy
{
    use HasModulePermission;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'branches.view');
    }

    public function view(User $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'branches.create');
    }

    public function update(User $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.update');
    }

    public function delete(User $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.delete');
    }
}
