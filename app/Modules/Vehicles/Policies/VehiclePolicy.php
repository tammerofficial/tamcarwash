<?php

namespace App\Modules\Vehicles\Policies;

use App\Models\TenantUser;
use App\Modules\Shared\Policies\HasModulePermission;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;

class VehiclePolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'vehicles.view');
    }

    public function view(TenantUser $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'vehicles.create');
    }

    public function update(TenantUser $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.update');
    }

    public function delete(TenantUser $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.delete');
    }

    public function manageCompanies(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'companies.manage');
    }

    public function viewCompany(TenantUser $user, Company $company): bool
    {
        return $this->hasPermission($user, 'companies.view');
    }
}
