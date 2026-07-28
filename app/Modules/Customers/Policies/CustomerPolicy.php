<?php

namespace App\Modules\Customers\Policies;

use App\Models\User;
use App\Modules\Customers\Models\Customer;
use App\Modules\Shared\Policies\HasModulePermission;

class CustomerPolicy
{
    use HasModulePermission;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'customers.view');
    }

    public function view(User $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'customers.create');
    }

    public function update(User $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.update');
    }

    public function delete(User $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.delete');
    }

    public function manageLoyalty(User $user, Customer $customer): bool
    {
        return $this->hasPermission($user, 'customers.loyalty');
    }
}
