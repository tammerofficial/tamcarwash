<?php

namespace App\Http\Middleware\Tenancy;

use App\Models\Landlord\Tenant;
use App\Services\Tenancy\TenantConnectionManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetAdminTenantContext
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $request->header('X-Tenant-Id')
            ?? $request->query('tenant_id')
            ?? $request->input('tenant_id');

        if (blank($tenantId)) {
            return response()->json([
                'message' => 'Tenant context required. Provide X-Tenant-Id header.',
            ], 422);
        }

        $tenant = Tenant::query()->findOrFail($tenantId);

        $this->connectionManager->connect($tenant);

        $request->attributes->set('tenant', $tenant);

        return $next($request);
    }
}
