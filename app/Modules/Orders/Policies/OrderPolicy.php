<?php

namespace App\Modules\Orders\Policies;

use App\Models\TenantUser;
use App\Modules\Orders\Models\Order;

class OrderPolicy
{
    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'orders.view');
    }

    public function view(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'orders.create');
    }

    public function update(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.update');
    }

    public function delete(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.delete');
    }

    public function transition(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.transition');
    }

    public function assignWorker(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.assign_worker');
    }

    protected function hasPermission(TenantUser $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
