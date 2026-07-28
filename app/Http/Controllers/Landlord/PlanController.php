<?php

namespace App\Http\Controllers\Landlord;

use App\Models\Landlord\Plan;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;

class PlanController extends ApiController
{
    public function index(): JsonResponse
    {
        $plans = Plan::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Plan $plan) => [
                'id' => $plan->id,
                'slug' => $plan->slug,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => (float) $plan->price_monthly,
                'price_yearly' => (float) $plan->price_yearly,
                'currency' => $plan->currency,
                'max_branches' => $plan->max_branches,
                'max_users' => $plan->max_users,
                'features' => $plan->features ?? [],
            ])
            ->values();

        return $this->success($plans);
    }
}
