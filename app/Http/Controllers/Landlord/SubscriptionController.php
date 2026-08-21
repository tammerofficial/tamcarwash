<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Requests\Landlord\UpdateSubscriptionRequest;
use App\Models\Landlord\Plan;
use App\Models\Landlord\Subscription;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 20), 100);

        $paginator = Subscription::query()
            ->with(['tenant:id,name,slug,status', 'plan:id,slug,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('plan'), fn ($q) => $q->whereHas('plan', fn ($plan) => $plan->where('slug', $request->string('plan'))))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->whereHas('tenant', fn ($tenant) => $tenant
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%"));
            })
            ->orderByDesc('starts_at')
            ->paginate($perPage);

        $items = collect($paginator->items())->map(fn (Subscription $subscription) => $this->transformSubscription($subscription));

        return response()->json([
            'data' => $items,
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ]);
    }

    public function show(Subscription $subscription): JsonResponse
    {
        $subscription->load(['tenant.plan', 'plan']);

        return $this->success($this->transformSubscription($subscription, detailed: true));
    }

    public function update(UpdateSubscriptionRequest $request, Subscription $subscription): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['plan_id'])) {
            $plan = Plan::query()->findOrFail($validated['plan_id']);
            $validated['amount'] = $validated['amount'] ?? ($validated['billing_cycle'] ?? $subscription->billing_cycle) === 'yearly'
                ? $plan->price_yearly
                : $plan->price_monthly;
            $validated['currency'] = $plan->currency;

            $subscription->tenant?->update(['plan_id' => $plan->id]);
        }

        if (($validated['status'] ?? null) === 'cancelled' && ! isset($validated['cancelled_at'])) {
            $validated['cancelled_at'] = now();
        }

        if (($validated['status'] ?? null) === 'active') {
            $validated['cancelled_at'] = null;
        }

        $subscription->update($validated);

        return $this->success(
            $this->transformSubscription($subscription->fresh(['tenant', 'plan']), detailed: true),
            'تم تحديث الاشتراك.',
        );
    }

    public function cancel(Subscription $subscription): JsonResponse
    {
        if ($subscription->status === 'cancelled') {
            return $this->success(
                $this->transformSubscription($subscription->load(['tenant', 'plan']), detailed: true),
                'الاشتراك ملغى مسبقاً.',
            );
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        $subscription->tenant?->update([
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);

        return $this->success(
            $this->transformSubscription($subscription->fresh(['tenant', 'plan']), detailed: true),
            'تم إلغاء الاشتراك.',
        );
    }

    public function reactivate(Subscription $subscription): JsonResponse
    {
        $subscription->update([
            'status' => 'active',
            'cancelled_at' => null,
            'ends_at' => $subscription->ends_at && $subscription->ends_at->isPast()
                ? now()->addDays(30)
                : $subscription->ends_at,
        ]);

        $subscription->tenant?->update([
            'status' => 'active',
            'suspended_at' => null,
            'activated_at' => $subscription->tenant->activated_at ?? now(),
        ]);

        return $this->success(
            $this->transformSubscription($subscription->fresh(['tenant', 'plan']), detailed: true),
            'تم إعادة تفعيل الاشتراك.',
        );
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformSubscription(Subscription $subscription, bool $detailed = false): array
    {
        $payload = [
            'id' => $subscription->id,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'amount' => (float) $subscription->amount,
            'currency' => $subscription->currency,
            'starts_at' => $subscription->starts_at?->toIso8601String(),
            'ends_at' => $subscription->ends_at?->toIso8601String(),
            'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
            'cancelled_at' => $subscription->cancelled_at?->toIso8601String(),
            'tenant' => $subscription->tenant ? [
                'id' => $subscription->tenant->id,
                'name' => $subscription->tenant->name,
                'slug' => $subscription->tenant->slug,
                'status' => $subscription->tenant->status,
            ] : null,
            'plan' => $subscription->plan ? [
                'id' => $subscription->plan->id,
                'slug' => $subscription->plan->slug,
                'name' => $subscription->plan->name,
            ] : null,
            'plan_id' => $subscription->plan_id,
            'tenant_id' => $subscription->tenant_id,
        ];

        if ($detailed && $subscription->tenant) {
            $payload['tenant']['email'] = $subscription->tenant->email;
            $payload['tenant']['phone'] = $subscription->tenant->phone;
            $payload['tenant']['plan'] = $subscription->tenant->plan?->only(['id', 'slug', 'name']);
        }

        return $payload;
    }
}
