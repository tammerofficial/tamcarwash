<?php

namespace App\Modules\Finance\Policies;

use App\Models\TenantUser;
use App\Modules\Shared\Policies\HasModulePermission;

class FinanceReportPolicy
{
    use HasModulePermission;

    public function viewReports(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'reports.view');
    }
}
