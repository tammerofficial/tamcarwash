<?php

namespace App\Modules\Finance\Policies;

use App\Models\TenantUser;
use App\Modules\Finance\Models\Payment;
use App\Modules\Shared\Policies\HasModulePermission;

class PaymentPolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'payments.view');
    }

    public function view(TenantUser $user, Payment $payment): bool
    {
        return $this->hasPermission($user, 'payments.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'payments.manage');
    }
}
