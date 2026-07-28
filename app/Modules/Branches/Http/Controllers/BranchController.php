<?php

namespace App\Modules\Branches\Http\Controllers;

use App\Modules\Branches\Http\Requests\StoreBranchHolidayRequest;
use App\Modules\Branches\Http\Requests\StoreBranchRequest;
use App\Modules\Branches\Http\Requests\StoreWashBayRequest;
use App\Modules\Branches\Http\Requests\UpdateBranchRequest;
use App\Modules\Branches\Http\Resources\BranchHolidayResource;
use App\Modules\Branches\Http\Resources\BranchResource;
use App\Modules\Branches\Http\Resources\WashBayResource;
use App\Modules\Branches\Models\Branch;
use App\Modules\Branches\Services\BranchService;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BranchController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected BranchService $branchService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Branch::class);

        $query = Branch::query()
            ->with(['workingHours', 'washBays', 'holidays'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%");
            });
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            BranchResource::class,
        );
    }

    public function store(StoreBranchRequest $request): JsonResponse
    {
        $branch = $this->branchService->create($request->validated());

        return $this->success(
            BranchResource::make($branch),
            'تم إنشاء الفرع بنجاح.',
            201,
        );
    }

    public function show(Branch $branch): JsonResponse
    {
        $this->authorize('view', $branch);

        $branch->load(['workingHours', 'washBays', 'holidays']);

        return $this->success(BranchResource::make($branch));
    }

    public function update(UpdateBranchRequest $request, Branch $branch): JsonResponse
    {
        $branch = $this->branchService->update($branch, $request->validated());

        return $this->success(BranchResource::make($branch), 'تم تحديث الفرع.');
    }

    public function destroy(Branch $branch): JsonResponse
    {
        $this->authorize('delete', $branch);

        $branch->delete();

        return $this->success(null, 'تم حذف الفرع.');
    }

    public function capacity(Branch $branch): JsonResponse
    {
        $this->authorize('view', $branch);

        return $this->success($this->branchService->getCapacitySummary($branch));
    }

    public function storeHoliday(StoreBranchHolidayRequest $request, Branch $branch): JsonResponse
    {
        $holiday = $this->branchService->addHoliday($branch, $request->validated());

        return $this->success(
            BranchHolidayResource::make($holiday),
            'تم إضافة العطلة.',
            201,
        );
    }

    public function storeWashBay(StoreWashBayRequest $request, Branch $branch): JsonResponse
    {
        $bay = $this->branchService->addWashBay($branch, $request->validated());

        return $this->success(
            WashBayResource::make($bay),
            'تم إضافة خط الغسيل.',
            201,
        );
    }
}
