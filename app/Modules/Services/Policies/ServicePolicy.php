<?php

namespace App\Modules\Services\Policies;

use App\Models\User;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Shared\Policies\HasModulePermission;

class ServicePolicy
{
    use HasModulePermission;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'services.view');
    }

    public function view(User $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'services.create');
    }

    public function update(User $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.update');
    }

    public function delete(User $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.delete');
    }

    public function manageCategories(User $user): bool
    {
        return $this->hasPermission($user, 'services.categories');
    }

    public function viewCategory(User $user, ServiceCategory $category): bool
    {
        return $this->hasPermission($user, 'services.view');
    }
}
