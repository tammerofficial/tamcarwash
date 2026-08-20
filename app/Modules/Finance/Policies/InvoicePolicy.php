<?php

namespace App\Modules\Finance\Policies;

use App\Models\TenantUser;
use App\Modules\Finance\Models\Invoice;
use App\Modules\Shared\Policies\HasModulePermission;

class InvoicePolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'invoices.view');
    }

    public function view(TenantUser $user, Invoice $invoice): bool
    {
        return $this->hasPermission($user, 'invoices.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'invoices.manage');
    }

    public function void(TenantUser $user, Invoice $invoice): bool
    {
        return $this->hasPermission($user, 'invoices.manage');
    }
}
