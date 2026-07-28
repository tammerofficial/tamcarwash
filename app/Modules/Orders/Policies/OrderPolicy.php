<?php

namespace App\Modules\Orders\Policies;

use App\Models\User;
use App\Modules\Orders\Models\Order;

class OrderPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'orders.view');
    }

    public function view(User $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'orders.create');
    }

    public function update(User $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.update');
    }

    public function delete(User $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.delete');
    }

    public function transition(User $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.transition');
    }

    public function assignWorker(User $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.assign_worker');
    }

    protected function hasPermission(User $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
