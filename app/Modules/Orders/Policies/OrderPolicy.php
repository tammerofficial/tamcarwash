<?php

namespace App\Modules\Orders\Policies;

use App\Models\TenantUser;
use App\Modules\Orders\Models\Order;
use App\Modules\Shared\Policies\HasModulePermission;

class OrderPolicy
{
    use HasModulePermission;

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
        return $this->hasPermission($user, 'orders.manage');
    }

    public function update(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.manage');
    }

    public function delete(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.manage');
    }

    public function transition(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.manage');
    }

    public function assignWorker(TenantUser $user, Order $order): bool
    {
        return $this->hasPermission($user, 'orders.manage');
    }
}
