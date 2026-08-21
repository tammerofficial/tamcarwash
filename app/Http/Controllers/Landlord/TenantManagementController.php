<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Requests\Landlord\StoreTenantRequest;
use App\Http\Requests\Landlord\UpdateTenantRequest;
use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use App\Models\Landlord\TenantProvisioningLog;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Services\Landlord\PlatformSettingsService;
use App\Services\Landlord\SubscriptionProvisioningService;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class TenantManagementController extends ApiController
{
    public function __construct(
        protected PlatformSettingsService $settings,
        protected TenantProvisioningService $provisioningService,
        protected TenantConnectionManager $connectionManager,
        protected SubscriptionProvisioningService $subscriptionService,
    ) {}

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

    public function store(StoreTenantRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $plan = Plan::query()->where('id', $validated['plan_id'])->where('is_active', true)->firstOrFail();
        $slug = $this->resolveSlug($validated['name'], $validated['slug'] ?? null);
        $ownerName = $validated['owner_name'] ?? $validated['name'];
        $ownerPassword = $validated['owner_password'] ?? Str::password(12);

        $tenant = null;

        try {
            $tenant = Tenant::query()->create([
                'name' => $validated['name'],
                'slug' => $slug,
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'] ?? 'provisioning',
                'plan_id' => $plan->id,
                'locale' => 'ar',
                'timezone' => 'Asia/Muscat',
                'country' => 'OM',
            ]);

            $this->provisioningService->provision($tenant, [
                'owner_email' => $validated['email'],
                'owner_password' => $ownerPassword,
                'owner_name' => $ownerName,
            ]);

            $this->subscriptionService->createForTenant($tenant, $plan);

            if (($validated['status'] ?? 'provisioning') === 'active') {
                $tenant->update([
                    'status' => 'active',
                    'activated_at' => now(),
                ]);
            }

            $tenant->refresh()->load(['plan', 'subscriptions']);

            return $this->success([
                'tenant' => $this->transformTenant($tenant, detailed: true),
                'owner' => [
                    'email' => $validated['email'],
                    'name' => $ownerName,
                    'temporary_password' => isset($validated['owner_password']) ? null : $ownerPassword,
                ],
            ], 'تم إنشاء المستأجر بنجاح.', 201);
        } catch (Throwable $e) {
            if ($tenant) {
                $this->rollbackFailedRegistration($tenant);
            }

            report($e);

            return $this->error('فشل إنشاء المستأجر. يرجى المحاولة مرة أخرى.', 500, 'tenant_create_failed');
        }
    }

    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load(['plan', 'domains', 'database', 'subscriptions.plan']);

        return $this->success($this->transformTenant($tenant, detailed: true));
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant): JsonResponse
    {
        $validated = $request->validated();

        if (isset($validated['status'])) {
            if ($validated['status'] === 'active') {
                $validated['suspended_at'] = null;
                $validated['activated_at'] = $tenant->activated_at ?? now();
            }

            if ($validated['status'] === 'suspended') {
                $validated['suspended_at'] = now();
            }
        }

        $tenant->update($validated);

        if (isset($validated['plan_id'])) {
            $tenant->subscriptions()
                ->whereIn('status', ['active', 'trial'])
                ->update(['plan_id' => $validated['plan_id']]);
        }

        return $this->success(
            $this->transformTenant($tenant->fresh(['plan', 'subscriptions'])),
            'تم تحديث المستأجر.',
        );
    }

    public function destroy(Tenant $tenant): JsonResponse
    {
        if ($tenant->status === 'active') {
            $tenant->update([
                'status' => 'suspended',
                'suspended_at' => now(),
            ]);
        }

        $tenant->delete();

        return $this->success(null, 'تم حذف المستأجر.');
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
            'plan_id' => $tenant->plan_id,
            'subscription_status' => $subscription?->status,
            'subscription_ends_at' => $subscription?->ends_at?->toIso8601String(),
            'trial_ends_at' => $tenant->trial_ends_at?->toIso8601String(),
            'created_at' => $tenant->created_at?->toIso8601String(),
            'activated_at' => $tenant->activated_at?->toIso8601String(),
            'suspended_at' => $tenant->suspended_at?->toIso8601String(),
            'dashboard_url' => $this->settings->tenantDashboardUrl($tenant->slug),
            'subdirectory_url' => $this->settings->tenantSubdirectoryUrl($tenant->slug),
            'subdomain_url' => $this->settings->tenantSubdomainUrl($tenant->slug),
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
                'billing_cycle' => $sub->billing_cycle,
                'starts_at' => $sub->starts_at?->toIso8601String(),
                'ends_at' => $sub->ends_at?->toIso8601String(),
                'cancelled_at' => $sub->cancelled_at?->toIso8601String(),
                'plan' => $sub->plan ? [
                    'id' => $sub->plan->id,
                    'slug' => $sub->plan->slug,
                    'name' => $sub->plan->name,
                ] : null,
            ])->values();
        }

        return $payload;
    }

    protected function resolveSlug(string $businessName, ?string $providedSlug): string
    {
        if (filled($providedSlug)) {
            return Str::lower($providedSlug);
        }

        $slug = Str::slug($businessName);

        if (blank($slug)) {
            $slug = 'wash-'.Str::lower(Str::random(6));
        }

        return $this->ensureUniqueSlug($slug);
    }

    protected function ensureUniqueSlug(string $baseSlug): string
    {
        $slug = Str::limit($baseSlug, 63, '');
        $candidate = $slug;
        $counter = 1;

        while (Tenant::query()->where('slug', $candidate)->exists()) {
            $suffix = '-'.$counter;
            $candidate = Str::limit($slug, 63 - strlen($suffix), '').$suffix;
            $counter++;
        }

        return $candidate;
    }

    protected function rollbackFailedRegistration(Tenant $tenant): void
    {
        try {
            $this->connectionManager->forgetCache($tenant);

            if ($this->tenantUsesSqlite()) {
                $path = $this->sqlitePathFor($tenant);
                if (is_file($path)) {
                    @unlink($path);
                }
            } else {
                $databaseName = config('tenancy.tenant_database_prefix', 'tamcarwash_tenant_')
                    .Str::slug($tenant->slug, '_');

                DB::connection('landlord')->statement("DROP DATABASE IF EXISTS `{$databaseName}`");
            }
        } catch (Throwable) {
            // Best-effort cleanup.
        }

        TenantProvisioningLog::query()->where('tenant_id', $tenant->id)->delete();
        $tenant->domains()->delete();
        $tenant->database()?->delete();
        $tenant->forceDelete();
    }

    protected function tenantUsesSqlite(): bool
    {
        return config('tenancy.database.tenant_driver', 'mysql') === 'sqlite';
    }

    protected function sqlitePathFor(Tenant $tenant): string
    {
        $directory = config('tenancy.database.tenant_sqlite_directory') ?: database_path('tenants');

        return rtrim($directory, DIRECTORY_SEPARATOR).DIRECTORY_SEPARATOR.$tenant->slug.'.sqlite';
    }
}
