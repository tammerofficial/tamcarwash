<?php

namespace App\Modules\Services\Http\Controllers;

use App\Modules\Services\Http\Requests\StoreServiceCategoryRequest;
use App\Modules\Services\Http\Resources\ServiceCategoryResource;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Services\Services\ServiceCatalogService;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class ServiceCategoryController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected ServiceCatalogService $catalogService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageCategories', Service::class);

        $categories = QueryBuilder::for(ServiceCategory::class)
            ->allowedFilters(AllowedFilter::exact('is_active'), AllowedFilter::partial('name'))
            ->allowedSorts('sort_order', 'name')
            ->allowedIncludes(['services'])
            ->paginate($request->integer('per_page', 50));

        return $this->paginatedResourceResponse($categories, ServiceCategoryResource::class);
    }

    public function store(StoreServiceCategoryRequest $request): JsonResponse
    {
        $category = $this->catalogService->createCategory($request->validated());

        return $this->success(ServiceCategoryResource::make($category), 'تم إنشاء التصنيف بنجاح.', 201);
    }

    public function show(ServiceCategory $serviceCategory): JsonResponse
    {
        $this->authorize('viewCategory', $serviceCategory);
        $serviceCategory->load('services');

        return $this->success(ServiceCategoryResource::make($serviceCategory));
    }
}
