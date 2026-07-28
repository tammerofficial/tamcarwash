<?php

namespace App\Modules\Vehicles\Http\Controllers;

use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use App\Modules\Vehicles\Http\Requests\StoreVehicleRequest;
use App\Modules\Vehicles\Http\Requests\UpdateVehicleRequest;
use App\Modules\Vehicles\Http\Resources\VehicleResource;
use App\Modules\Vehicles\Models\Vehicle;
use App\Modules\Vehicles\Services\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VehicleController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected VehicleService $vehicleService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Vehicle::class);

        $query = Vehicle::query()
            ->with(['customer', 'company'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('plate_number', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%");
            });
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->integer('customer_id'));
        }

        if ($request->filled('vehicle_type')) {
            $query->where('vehicle_type', $request->string('vehicle_type'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            VehicleResource::class,
        );
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        $vehicle = $this->vehicleService->create($request->validated());

        return $this->success(
            VehicleResource::make($vehicle->load(['customer', 'company'])),
            'تم إنشاء المركبة بنجاح.',
            201,
        );
    }

    public function show(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('view', $vehicle);

        $vehicle->load(['customer', 'company']);

        return $this->success(VehicleResource::make($vehicle));
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle): JsonResponse
    {
        $vehicle = $this->vehicleService->update($vehicle, $request->validated());

        return $this->success(VehicleResource::make($vehicle), 'تم تحديث المركبة.');
    }

    public function destroy(Vehicle $vehicle): JsonResponse
    {
        $this->authorize('delete', $vehicle);

        $vehicle->delete();

        return $this->success(null, 'تم حذف المركبة.');
    }
}
