<?php

namespace App\Http\Controllers\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;

class DashboardController extends ApiController
{
    public function stats(): JsonResponse
    {
        $activeSubscriptions = Subscription::query()->whereIn('status', ['active', 'trial']);

        $planBreakdown = Plan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(function (Plan $plan) {
                $tenantCount = Tenant::query()->where('plan_id', $plan->id)->count();

                return [
                    'id' => $plan->id,
                    'slug' => $plan->slug,
                    'name' => $plan->name,
                    'price_monthly' => (float) $plan->price_monthly,
                    'tenants_count' => $tenantCount,
                ];
            })
            ->values();

        return $this->success([
            'tenants_total' => Tenant::query()->count(),
            'tenants_active' => Tenant::query()->where('status', 'active')->count(),
            'tenants_trial' => Tenant::query()
                ->whereNotNull('trial_ends_at')
                ->where('trial_ends_at', '>=', now())
                ->count(),
            'tenants_suspended' => Tenant::query()->where('status', 'suspended')->count(),
            'subscriptions_active' => Subscription::query()->where('status', 'active')->count(),
            'subscriptions_trial' => Subscription::query()->where('status', 'trial')->count(),
            'subscriptions_past_due' => Subscription::query()->where('status', 'past_due')->count(),
            'mrr' => round((float) $activeSubscriptions->sum('amount'), 2),
            'currency' => 'OMR',
            'plans_breakdown' => $planBreakdown,
        ]);
    }
}
