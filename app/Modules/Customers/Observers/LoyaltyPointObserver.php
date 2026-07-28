<?php

namespace App\Modules\Customers\Observers;

use App\Modules\Customers\Models\LoyaltyPoint;

class LoyaltyPointObserver
{
    public function created(LoyaltyPoint $loyaltyPoint): void
    {
        $customer = $loyaltyPoint->customer;

        if (! $customer) {
            return;
        }

        $newBalance = $customer->loyalty_points_balance + $loyaltyPoint->points;

        $loyaltyPoint->updateQuietly(['balance_after' => $newBalance]);
        $customer->update(['loyalty_points_balance' => $newBalance]);
    }
}
