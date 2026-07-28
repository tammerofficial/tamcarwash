<?php

namespace App\Http\Controllers\Landlord;

use App\Http\Requests\Landlord\RegisterTenantRequest;
use App\Models\Landlord\Plan;
use App\Models\Landlord\Tenant;
use App\Models\Landlord\TenantProvisioningLog;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantProvisioningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class TenantRegistrationController extends ApiController
{
    public function __construct(
        protected TenantProvisioningService $provisioningService,
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function register(RegisterTenantRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $slug = $this->resolveSlug($validated['business_name'], $validated['slug'] ?? null);
        $plan = Plan::query()
            ->where('slug', $request->resolvedPlanSlug())
            ->where('is_active', true)
            ->firstOrFail();

        $tenant = null;

        try {
            $tenant = Tenant::query()->create([
                'name' => $validated['business_name'],
                'slug' => $slug,
                'email' => $validated['owner_email'],
                'phone' => $validated['phone'] ?? null,
                'status' => 'provisioning',
                'plan_id' => $plan->id,
                'locale' => 'ar',
                'timezone' => 'Asia/Muscat',
                'country' => 'OM',
            ]);

            $this->provisioningService->provision($tenant, [
                'owner_email' => $validated['owner_email'],
                'owner_password' => $validated['owner_password'],
                'owner_name' => $validated['owner_name'],
            ]);

            $tenant->refresh();

            return $this->success([
                'tenant' => [
                    'id' => $tenant->id,
                    'slug' => $tenant->slug,
                    'name' => $tenant->name,
                    'plan' => [
                        'slug' => $plan->slug,
                        'name' => $plan->name,
                    ],
                    'domain' => $this->primaryDomainFor($tenant),
                ],
                'owner' => [
                    'email' => $validated['owner_email'],
                    'name' => $validated['owner_name'],
                ],
                'login' => [
                    'tenant_slug' => $tenant->slug,
                    'endpoint' => url('/api/v1/auth/login'),
                    'header' => 'X-Tenant-Slug',
                    'instructions' => 'POST to tenant auth/login with X-Tenant-Slug header to establish session.',
                ],
            ], 'تم إنشاء المغسلة بنجاح. يمكنك تسجيل الدخول الآن.', 201);
        } catch (Throwable $e) {
            if ($tenant) {
                $this->rollbackFailedRegistration($tenant);
            }

            report($e);

            return $this->error(
                'فشل إنشاء المغسلة. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.',
                500,
                'tenant_registration_failed',
            );
        }
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

    protected function primaryDomainFor(Tenant $tenant): string
    {
        return "{$tenant->slug}.".config('tenancy.platform_domain');
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
            // Best-effort cleanup; landlord records are removed below.
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
