<?php

namespace App\Services\Landlord;

use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;

class SubscriptionLifecycleService
{
    /**
     * @return array{trials_expired: int, subscriptions_overdue: int}
     */
    public function processDueSubscriptions(): array
    {
        $trialsExpired = 0;
        $subscriptionsOverdue = 0;

        $expiredTrials = Tenant::query()
            ->whereNotNull('trial_ends_at')
            ->where('trial_ends_at', '<', now())
            ->where('status', 'active')
            ->get();

        foreach ($expiredTrials as $tenant) {
            $tenant->update(['status' => 'suspended', 'suspended_at' => now()]);
            $trialsExpired++;

            Subscription::query()
                ->where('tenant_id', $tenant->id)
                ->where('status', 'trial')
                ->update(['status' => 'past_due']);
        }

        $overdueSubscriptions = Subscription::query()
            ->whereIn('status', ['active', 'trial'])
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', now())
            ->get();

        foreach ($overdueSubscriptions as $subscription) {
            $subscription->update(['status' => 'past_due']);
            $subscriptionsOverdue++;

            $subscription->tenant?->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);
        }

        return [
            'trials_expired' => $trialsExpired,
            'subscriptions_overdue' => $subscriptionsOverdue,
        ];
    }
}
