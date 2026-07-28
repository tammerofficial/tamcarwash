<?php

namespace App\Http\Middleware\Tenancy;

use App\Services\Tenancy\TenantConnectionManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenantByCustomDomain
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();
        $platformDomain = config('tenancy.platform_domain');

        if ($this->isCentralDomain($host) || str_ends_with($host, ".{$platformDomain}")) {
            return $next($request);
        }

        $this->connectionManager->connectByDomain($host);

        return $next($request);
    }

    protected function isCentralDomain(string $host): bool
    {
        return in_array($host, config('tenancy.central_domains', []), true);
    }
}
