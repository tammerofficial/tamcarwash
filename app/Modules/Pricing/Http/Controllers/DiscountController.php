<?php

namespace App\Modules\Pricing\Http\Controllers;

use App\Modules\Pricing\Http\Requests\StoreDiscountRequest;
use App\Modules\Pricing\Http\Resources\DiscountResource;
use App\Modules\Pricing\Models\Discount;
use App\Modules\Pricing\Services\PricingService;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class DiscountController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected PricingService $pricingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Discount::class);

        $discounts = QueryBuilder::for(Discount::class)
            ->allowedFilters(AllowedFilter::exact('is_active'), AllowedFilter::exact('type'))
            ->allowedIncludes('coupons')
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResourceResponse($discounts, DiscountResource::class);
    }

    public function store(StoreDiscountRequest $request): JsonResponse
    {
        $discount = $this->pricingService->createDiscount($request->validated());

        return $this->success(DiscountResource::make($discount), 'تم إنشاء الخصم.', 201);
    }
}
