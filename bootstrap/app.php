<?php

use App\Http\Middleware\EnsureFrontendRequestsAreStateful;
use App\Http\Middleware\Tenancy\EnsureLandlordContext;
use App\Http\Middleware\Tenancy\EnsureTenantContext;
use App\Http\Middleware\Tenancy\IdentifyTenantByCustomDomain;
use App\Http\Middleware\Tenancy\IdentifyTenantByHeader;
use App\Http\Middleware\Tenancy\IdentifyTenantBySubdirectory;
use App\Http\Middleware\Tenancy\IdentifyTenantBySubdomain;
use App\Http\Middleware\Tenancy\SetAdminTenantContext;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
        then: function () {
            Route::get('/ping', fn () => response()->json([
                'ok' => true,
                'central_domains' => config('tenancy.central_domains'),
                'session_driver' => config('session.driver'),
            ]));

            Route::middleware(['api', 'landlord'])
                ->prefix('api/landlord/v1')
                ->group(base_path('routes/landlord.php'));

            Route::middleware([
                'api',
                IdentifyTenantBySubdomain::class,
                IdentifyTenantByCustomDomain::class,
                IdentifyTenantBySubdirectory::class,
                IdentifyTenantByHeader::class,
                'tenant.context',
            ])
                ->prefix('api/v1')
                ->group(base_path('routes/tenant.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Avoid session boot on API when production env/session storage is misconfigured.
        if (env('APP_ENV') !== 'production') {
            $middleware->statefulApi();

            $middleware->replaceInGroup(
                'api',
                \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
                EnsureFrontendRequestsAreStateful::class,
            );
        }

        $middleware->alias([
            'landlord' => EnsureLandlordContext::class,
            'tenant.context' => EnsureTenantContext::class,
            'tenant.subdomain' => IdentifyTenantBySubdomain::class,
            'tenant.domain' => IdentifyTenantByCustomDomain::class,
            'tenant.subdirectory' => IdentifyTenantBySubdirectory::class,
            'tenant.header' => IdentifyTenantByHeader::class,
            'tenant.admin' => SetAdminTenantContext::class,
        ]);

        $middleware->prependToGroup('api', [
            IdentifyTenantBySubdomain::class,
            IdentifyTenantByCustomDomain::class,
            IdentifyTenantBySubdirectory::class,
            IdentifyTenantByHeader::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );
    })->create();
