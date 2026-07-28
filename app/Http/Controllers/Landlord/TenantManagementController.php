<?php

namespace App\Http\Controllers\Landlord;

use App\Models\Landlord\Tenant;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TenantManagementController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->integer('per_page', 20), 100);

        $paginator = Tenant::query()
            ->with(['plan:id,slug,name', 'subscriptions' => fn ($q) => $q->latest('starts_at')->limit(1)])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->string('search');
                $q->where(function ($inner) use ($search) {
                    $inner->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderByDesc('created_at')
            ->paginate($perPage);

        $items = collect($paginator->items())->map(fn (Tenant $tenant) => $this->transformTenant($tenant));

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

    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load(['plan', 'domains', 'database', 'subscriptions.plan']);

        return $this->success($this->transformTenant($tenant, detailed: true));
    }

    public function update(Request $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:active,suspended,pending,provisioning'],
        ]);

        if (($validated['status'] ?? null) === 'active') {
            $tenant->update([
                'status' => 'active',
                'suspended_at' => null,
                'activated_at' => $tenant->activated_at ?? now(),
            ]);
        }

        if (($validated['status'] ?? null) === 'suspended') {
            $tenant->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);
        }

        return $this->success($this->transformTenant($tenant->fresh(['plan', 'subscriptions'])), 'تم تحديث المستأجر.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function transformTenant(Tenant $tenant, bool $detailed = false): array
    {
        $subscription = $tenant->subscriptions->first();

        $payload = [
            'id' => $tenant->id,
            'name' => $tenant->name,
            'slug' => $tenant->slug,
            'email' => $tenant->email,
            'phone' => $tenant->phone,
            'status' => $tenant->status,
            'plan' => $tenant->plan ? [
                'id' => $tenant->plan->id,
                'slug' => $tenant->plan->slug,
                'name' => $tenant->plan->name,
            ] : null,
            'subscription_status' => $subscription?->status,
            'subscription_ends_at' => $subscription?->ends_at?->toIso8601String(),
            'trial_ends_at' => $tenant->trial_ends_at?->toIso8601String(),
            'created_at' => $tenant->created_at?->toIso8601String(),
            'subdirectory_url' => url("/{$tenant->slug}/dashboard"),
            'subdomain_url' => "https://{$tenant->slug}.".config('tenancy.platform_domain'),
        ];

        if ($detailed) {
            $payload['domains'] = $tenant->domains?->map(fn ($domain) => [
                'domain' => $domain->domain,
                'type' => $domain->type,
                'is_primary' => $domain->is_primary,
            ])->values();
            $payload['database_status'] = $tenant->database?->status;
            $payload['subscriptions'] = $tenant->subscriptions?->map(fn ($sub) => [
                'id' => $sub->id,
                'status' => $sub->status,
                'amount' => (float) $sub->amount,
                'currency' => $sub->currency,
                'starts_at' => $sub->starts_at?->toIso8601String(),
                'ends_at' => $sub->ends_at?->toIso8601String(),
                'plan' => $sub->plan?->only(['slug', 'name']),
            ])->values();
        }

        return $payload;
    }
}
