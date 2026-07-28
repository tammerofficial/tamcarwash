<?php

namespace App\Modules\Services\Http\Controllers;

use App\Modules\Services\Http\Requests\StoreServiceRequest;
use App\Modules\Services\Http\Requests\UpdateServiceRequest;
use App\Modules\Services\Http\Resources\ServiceResource;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Services\ServiceCatalogService;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected ServiceCatalogService $serviceCatalogService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Service::class);

        $query = Service::query()
            ->with(['category', 'addons', 'vehicleTypePrices'])
            ->orderBy('sort_order');

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('name_ar', 'like', "%{$search}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            ServiceResource::class,
        );
    }

    public function store(StoreServiceRequest $request): JsonResponse
    {
        $service = $this->serviceCatalogService->createService($request->validated());

        return $this->success(
            ServiceResource::make($service),
            'تم إنشاء الخدمة بنجاح.',
            201,
        );
    }

    public function show(Service $service): JsonResponse
    {
        $this->authorize('view', $service);

        $service->load(['category', 'addons', 'vehicleTypePrices', 'consumables', 'branches']);

        return $this->success(ServiceResource::make($service));
    }

    public function update(UpdateServiceRequest $request, Service $service): JsonResponse
    {
        $service = $this->serviceCatalogService->updateService($service, $request->validated());

        return $this->success(ServiceResource::make($service), 'تم تحديث الخدمة.');
    }

    public function destroy(Service $service): JsonResponse
    {
        $this->authorize('delete', $service);

        $service->delete();

        return $this->success(null, 'تم حذف الخدمة.');
    }
}
