<?php

namespace App\Modules\Pricing\Http\Controllers;

use App\Modules\Pricing\Http\Requests\StorePeakHourPricingRequest;
use App\Modules\Pricing\Http\Resources\PeakHourPricingResource;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Pricing\Services\PricingService;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class PeakHourPricingController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected PricingService $pricingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', PeakHourPricing::class);

        $items = QueryBuilder::for(PeakHourPricing::class)
            ->allowedFilters(
                AllowedFilter::exact('branch_id'),
                AllowedFilter::exact('day_of_week'),
                AllowedFilter::exact('is_active'),
            )
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResourceResponse($items, PeakHourPricingResource::class);
    }

    public function store(StorePeakHourPricingRequest $request): JsonResponse
    {
        $item = $this->pricingService->createPeakHourPricing($request->validated());

        return $this->success(PeakHourPricingResource::make($item), 'تم إنشاء تسعير ساعة الذروة.', 201);
    }
}
