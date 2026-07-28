<?php

namespace App\Http\Middleware\Tenancy;

use App\Services\Tenancy\TenantConnectionManager;
use App\Services\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenantBySubdirectory
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
        protected TenantContext $tenantContext,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! config('tenancy.subdirectory_enabled', false)) {
            return $next($request);
        }

        if ($this->tenantContext->isInitialized()) {
            return $next($request);
        }

        $host = $request->getHost();

        if (! $this->isCentralDomain($host)) {
            return $next($request);
        }

        $slug = $this->resolveSlugFromPath($request);

        if (blank($slug)) {
            return $next($request);
        }

        $this->connectionManager->connectBySlug($slug);

        return $next($request);
    }

    protected function resolveSlugFromPath(Request $request): ?string
    {
        $segment = $request->segment(1);

        if (blank($segment)) {
            return null;
        }

        $reserved = config('tenancy.reserved_paths', []);

        if (in_array(strtolower($segment), $reserved, true)) {
            return null;
        }

        return strtolower($segment);
    }

    protected function isCentralDomain(string $host): bool
    {
        return in_array($host, config('tenancy.central_domains', []), true);
    }
}
