<?php

namespace App\Http\Controllers\Landlord;

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
            ->orderByDesc('starts_at')
            ->paginate($perPage);

        $items = collect($paginator->items())->map(fn (Subscription $subscription) => [
            'id' => $subscription->id,
            'status' => $subscription->status,
            'billing_cycle' => $subscription->billing_cycle,
            'amount' => (float) $subscription->amount,
            'currency' => $subscription->currency,
            'starts_at' => $subscription->starts_at?->toIso8601String(),
            'ends_at' => $subscription->ends_at?->toIso8601String(),
            'trial_ends_at' => $subscription->trial_ends_at?->toIso8601String(),
            'tenant' => $subscription->tenant ? [
                'id' => $subscription->tenant->id,
                'name' => $subscription->tenant->name,
                'slug' => $subscription->tenant->slug,
                'status' => $subscription->tenant->status,
            ] : null,
            'plan' => $subscription->plan ? [
                'slug' => $subscription->plan->slug,
                'name' => $subscription->plan->name,
            ] : null,
        ]);

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
}
