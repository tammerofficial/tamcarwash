<?php

namespace App\Http\Middleware\Tenancy;

use App\Services\Tenancy\TenantConnectionManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureLandlordContext
{
    public function __construct(
        protected TenantConnectionManager $connectionManager,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $this->connectionManager->useLandlord();

        return $next($request);
    }
}
