<?php

namespace App\Http\Middleware\Tenancy;

use App\Services\Tenancy\TenantConnectionManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenantBySubdomain
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $platformDomain = config('tenancy.platform_domain');

        if ($this->isCentralDomain($host)) {
            return $next($request);
        }

        if (! str_ends_with($host, ".{$platformDomain}")) {
            return $next($request);
        }

        $subdomain = str_replace(".{$platformDomain}", '', $host);

        if (blank($subdomain) || in_array($subdomain, ['www', 'api', 'admin'], true)) {
            return $next($request);
        }

        $this->connectionManager->connectBySlug($subdomain);

        return $next($request);
    }

    protected function isCentralDomain(string $host): bool
    {
        return in_array($host, config('tenancy.central_domains', []), true);
    }
}
