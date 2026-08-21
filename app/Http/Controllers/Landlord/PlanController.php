<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Requests\Landlord\StorePlanRequest;
use App\Http\Requests\Landlord\UpdatePlanRequest;
use App\Models\Landlord\Plan;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Support\PlanFeatureCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlanController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $query = Plan::query()->orderBy('sort_order');

        if (! auth('platform')->check()) {
            $query->where('is_active', true);
        }

        $plans = $query->get()->map(fn (Plan $plan) => $this->transformPlan($plan))->values();

        return $this->success($plans);
    }

    public function store(StorePlanRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $validated['currency'] = $validated['currency'] ?? 'OMR';
        $validated['is_active'] = $validated['is_active'] ?? true;
        $validated['features'] = PlanFeatureCatalog::normalize(
            $validated['features'] ?? null,
            $validated['slug'] ?? null,
        );

        $plan = Plan::query()->create($validated);

        return $this->success($this->transformPlan($plan), 'تم إنشاء الباقة.', 201);
    }

    public function show(Plan $plan): JsonResponse
    {
        $plan->loadCount('tenants');

        return $this->success($this->transformPlan($plan, detailed: true));
    }

    public function update(UpdatePlanRequest $request, Plan $plan): JsonResponse
    {
        $validated = $request->validated();

        if (array_key_exists('features', $validated)) {
            $validated['features'] = PlanFeatureCatalog::normalize(
                $validated['features'],
                $validated['slug'] ?? $plan->slug,
            );
        }

        $plan->update($validated);

        return $this->success($this->transformPlan($plan->fresh()), 'تم تحديث الباقة.');
    }

    public function destroy(Plan $plan): JsonResponse
    {
        if ($plan->tenants()->where('status', 'active')->exists()) {
            return $this->error('لا يمكن حذف باقة مرتبطة بمستأجرين نشطين.', 422, 'plan_has_active_tenants');
        }

        $plan->update(['is_active' => false]);
        $plan->delete();

        return $this->success(null, 'تم إلغاء تفعيل الباقة.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformPlan(Plan $plan, bool $detailed = false): array
    {
        $payload = [
            'id' => $plan->id,
            'slug' => $plan->slug,
            'name' => $plan->name,
            'description' => $plan->description,
            'price_monthly' => (float) $plan->price_monthly,
            'price_yearly' => (float) $plan->price_yearly,
            'currency' => $plan->currency,
            'max_branches' => $plan->max_branches,
            'max_users' => $plan->max_users,
            'max_vehicles_per_day' => $plan->max_vehicles_per_day,
            'features' => $plan->featureMap(),
            'is_active' => (bool) $plan->is_active,
            'sort_order' => $plan->sort_order,
            'created_at' => $plan->created_at?->toIso8601String(),
        ];

        if ($detailed) {
            $payload['tenants_count'] = $plan->tenants_count ?? $plan->tenants()->count();
        }

        return $payload;
    }
}
