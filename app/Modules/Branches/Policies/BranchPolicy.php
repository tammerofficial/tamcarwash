<?php

namespace App\Modules\Branches\Policies;

use App\Models\TenantUser;
use App\Modules\Branches\Models\Branch;
use App\Modules\Shared\Policies\HasModulePermission;

class BranchPolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'branches.view');
    }

    public function view(TenantUser $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'branches.create');
    }

    public function update(TenantUser $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.update');
    }

    public function delete(TenantUser $user, Branch $branch): bool
    {
        return $this->hasPermission($user, 'branches.delete');
    }
}
