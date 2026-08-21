<?php

namespace App\Http\Middleware;

use App\Services\Landlord\TenantPlanService;
use App\Support\PlanFeatureCatalog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePlanFeature
{
    public function __construct(
        protected TenantPlanService $tenantPlanService,
    ) {}

    public function handle(Request $request, Closure $next, string ...$features): Response
    {
        $keys = collect($features)
            ->flatMap(fn (string $feature) => explode(',', $feature))
            ->map(fn (string $feature) => PlanFeatureCatalog::canonicalKey(trim($feature)))
            ->filter()
            ->unique()
            ->values();

        if ($keys->isEmpty()) {
            return $next($request);
        }

        foreach ($keys as $feature) {
            if ($this->tenantPlanService->hasFeature($feature)) {
                return $next($request);
            }
        }

        return response()->json([
            'success' => false,
            'message' => 'هذه الميزة غير متاحة في باقتك الحالية.',
            'code' => 'feature_not_available',
            'feature' => $keys->first(),
        ], 403);
    }
}
