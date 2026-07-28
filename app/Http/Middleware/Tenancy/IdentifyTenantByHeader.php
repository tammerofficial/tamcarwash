<?php

namespace App\Http\Middleware\Tenancy;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenantByHeader
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
        protected TenantContext $tenantContext,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($this->tenantContext->isInitialized()) {
            return $next($request);
        }

        $tenantId = $request->header('X-Tenant-Id');
        $tenantSlug = $request->header('X-Tenant-Slug');

        if (blank($tenantSlug) && app()->environment('local')) {
            $tenantSlug = $request->input('tenant_slug');
        }

        if (filled($tenantId)) {
            $tenant = Tenant::query()->findOrFail($tenantId);
            $this->connectionManager->connect($tenant);

            return $next($request);
        }

        if (filled($tenantSlug)) {
            $this->connectionManager->connectBySlug($tenantSlug);

            return $next($request);
        }

        if ($this->shouldUseLocalDefault($request)) {
            $slug = config('tenancy.local_default_tenant_slug');

            if (filled($slug)) {
                try {
                    $this->connectionManager->connectBySlug($slug);
                } catch (\Throwable) {
                    // Demo tenant may not be provisioned yet; EnsureTenantContext handles the response.
                }
            }
        }

        return $next($request);
    }

    protected function shouldUseLocalDefault(Request $request): bool
    {
        if (! app()->environment('local')) {
            return false;
        }

        return in_array($request->getHost(), config('tenancy.central_domains', []), true);
    }
}
