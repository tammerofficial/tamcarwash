<?php

namespace App\Http\Middleware\Tenancy;

use App\Services\Tenancy\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantContext
{
    public function __construct(
        protected TenantContext $tenantContext,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->tenantContext->isInitialized()) {
            return response()->json([
                'message' => 'Tenant context not initialized.',
            ], 404);
        }

        return $next($request);
    }
}
