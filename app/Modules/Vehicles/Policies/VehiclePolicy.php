<?php

namespace App\Modules\Vehicles\Policies;

use App\Models\User;
use App\Modules\Shared\Policies\HasModulePermission;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;

class VehiclePolicy
{
    use HasModulePermission;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'vehicles.view');
    }

    public function view(User $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'vehicles.create');
    }

    public function update(User $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.update');
    }

    public function delete(User $user, Vehicle $vehicle): bool
    {
        return $this->hasPermission($user, 'vehicles.delete');
    }

    public function manageCompanies(User $user): bool
    {
        return $this->hasPermission($user, 'companies.manage');
    }

    public function viewCompany(User $user, Company $company): bool
    {
        return $this->hasPermission($user, 'companies.view');
    }
}
