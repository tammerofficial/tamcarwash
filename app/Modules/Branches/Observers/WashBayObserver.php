<?php

namespace App\Modules\Branches\Observers;

use App\Modules\Branches\Models\WashBay;
use App\Modules\Branches\Services\BranchService;

class WashBayObserver
{
    public function __construct(
        protected BranchService $branchService,
    ) {}

    public function saved(WashBay $washBay): void
    {
        if ($washBay->branch) {
            $this->branchService->syncCapacityFromBays($washBay->branch);
        }
    }

    public function deleted(WashBay $washBay): void
    {
        if ($washBay->branch) {
            $this->branchService->syncCapacityFromBays($washBay->branch);
        }
    }
}
