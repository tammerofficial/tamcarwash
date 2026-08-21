<?php

namespace App\Services\Landlord;

use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Models\Landlord\Tenant;
use App\Modules\Branches\Models\Branch;
use App\Services\Tenancy\TenantContext;
use App\Support\PlanFeatureCatalog;
use Carbon\CarbonInterface;

class TenantPlanService
{
    /**
     * @return array<string, mixed>|null
     */
    public function getPlanMeta(?Tenant $tenant = null): ?array
    {
        $tenant ??= app(TenantContext::class)->get();

        if (! $tenant) {
            return null;
        }

        $tenant->loadMissing('plan');

        $plan = $tenant->plan;

        if (! $plan) {
            return null;
        }

        $subscription = Subscription::query()
            ->where('tenant_id', $tenant->id)
            ->whereIn('status', ['active', 'trial'])
            ->orderByDesc('starts_at')
            ->first();

        $endsAt = $subscription?->ends_at ?? $tenant->trial_ends_at;
        $branchCount = Branch::query()->count();
        $maxBranches = $plan->max_branches;

        return [
            'plan_name' => $plan->name,
            'plan_slug' => $plan->slug,
            'subscription_status' => $subscription?->status ?? 'none',
            'subscription_starts_at' => $subscription?->starts_at?->toIso8601String(),
            'subscription_ends_at' => $endsAt instanceof CarbonInterface ? $endsAt->toIso8601String() : null,
            'days_remaining' => $this->daysRemaining($endsAt),
            'features' => $plan->featureMap(),
            'limits' => [
                'max_branches' => $maxBranches,
                'max_users' => $plan->max_users,
                'max_vehicles_per_day' => $plan->max_vehicles_per_day,
            ],
            'usage' => [
                'branches' => $branchCount,
            ],
            'can_add_branch' => $maxBranches === null || $branchCount < $maxBranches,
        ];
    }

    /**
     * @return array<string, bool>
     */
    public function enabledFeatures(?Tenant $tenant = null): array
    {
        $tenant ??= app(TenantContext::class)->get();

        if (! $tenant) {
            return PlanFeatureCatalog::allEnabled();
        }

        $tenant->loadMissing('plan');

        if (! $tenant->plan) {
            return PlanFeatureCatalog::allEnabled();
        }

        return $tenant->plan->featureMap();
    }

    public function hasFeature(string $feature, ?Tenant $tenant = null): bool
    {
        $tenant ??= app(TenantContext::class)->get();

        if (! $tenant) {
            return true;
        }

        $tenant->loadMissing('plan');

        if (! $tenant->plan) {
            return true;
        }

        return $tenant->plan->hasFeature($feature);
    }

    protected function daysRemaining(mixed $endsAt): ?int
    {
        if (! $endsAt instanceof CarbonInterface) {
            return null;
        }

        return max(0, (int) now()->diffInDays($endsAt, false));
    }
}
