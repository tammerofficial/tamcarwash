<?php

namespace App\Services\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;

class SubscriptionProvisioningService
{
    /**
     * Create an active subscription when a tenant registers.
     * Starter plans receive a 14-day trial; other plans get 30 days.
     */
    public function createForTenant(Tenant $tenant, Plan $plan): Subscription
    {
        $isTrial = $plan->slug === 'starter';
        $startsAt = now();
        $endsAt = $isTrial ? $startsAt->copy()->addDays(14) : $startsAt->copy()->addDays(30);

        if ($isTrial) {
            $tenant->update(['trial_ends_at' => $endsAt]);
        }

        return Subscription::query()->create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => $isTrial ? 'trial' : 'active',
            'billing_cycle' => 'monthly',
            'amount' => $plan->price_monthly,
            'currency' => $plan->currency ?? 'OMR',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'trial_ends_at' => $isTrial ? $endsAt : null,
        ]);
    }
}
