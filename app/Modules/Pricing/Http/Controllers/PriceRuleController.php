<?php

namespace App\Modules\Pricing\Http\Controllers;

use App\Modules\Pricing\Http\Requests\StorePriceRuleRequest;
use App\Modules\Pricing\Http\Requests\UpdatePriceRuleRequest;
use App\Modules\Pricing\Http\Resources\PriceRuleResource;
use App\Modules\Pricing\Models\PriceRule;
use App\Modules\Pricing\Services\PricingService;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PriceRuleController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected PricingService $pricingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PriceRule::class);

        $query = PriceRule::query()->orderByDesc('priority');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->integer('branch_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            PriceRuleResource::class,
        );
    }

    public function store(StorePriceRuleRequest $request): JsonResponse
    {
        $rule = $this->pricingService->createPriceRule($request->validated());

        return $this->success(
            PriceRuleResource::make($rule),
            'تم إنشاء قاعدة التسعير.',
            201,
        );
    }

    public function show(PriceRule $priceRule): JsonResponse
    {
        $this->authorize('viewAny', PriceRule::class);

        return $this->success(PriceRuleResource::make($priceRule));
    }

    public function update(UpdatePriceRuleRequest $request, PriceRule $priceRule): JsonResponse
    {
        $priceRule->update($request->validated());

        return $this->success(PriceRuleResource::make($priceRule->fresh()), 'تم تحديث قاعدة التسعير.');
    }

    public function destroy(PriceRule $priceRule): JsonResponse
    {
        $this->authorize('updatePriceRule', $priceRule);

        $priceRule->delete();

        return $this->success(null, 'تم حذف قاعدة التسعير.');
    }
}
