<?php

namespace App\Modules\Services\Policies;

use App\Models\TenantUser;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Shared\Policies\HasModulePermission;

class ServicePolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'services.view');
    }

    public function view(TenantUser $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'services.create');
    }

    public function update(TenantUser $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.update');
    }

    public function delete(TenantUser $user, Service $service): bool
    {
        return $this->hasPermission($user, 'services.delete');
    }

    public function manageCategories(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'services.categories');
    }

    public function viewCategory(TenantUser $user, ServiceCategory $category): bool
    {
        return $this->hasPermission($user, 'services.view');
    }
}
