<?php

namespace App\Modules\Customers\Policies;

use App\Models\TenantUser;
use App\Modules\Customers\Models\Customer;
use App\Modules\Shared\Policies\HasModulePermission;

class CustomerPolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'customers.view');
    }

    public function view(TenantUser $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'customers.create');
    }

    public function update(TenantUser $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.update');
    }

    public function delete(TenantUser $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.delete');
    }

    public function manageLoyalty(TenantUser $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.loyalty');
    }
}
