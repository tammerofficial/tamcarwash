<?php

namespace App\Modules\Vehicles\Http\Controllers;

use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Vehicles\Http\Requests\StoreCompanyRequest;
use App\Modules\Vehicles\Http\Resources\CompanyResource;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;
use App\Modules\Vehicles\Services\VehicleService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class CompanyController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected VehicleService $vehicleService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('manageCompanies', Vehicle::class);

        $companies = QueryBuilder::for(Company::class)
            ->allowedFilters([
                AllowedFilter::exact('is_active'),
                AllowedFilter::partial('name'),
            ])
            ->allowedSorts(['name', 'created_at'])
            ->withCount(['vehicles', 'customers'])
            ->paginate($request->integer('per_page', 20));

        return $this->paginatedResourceResponse($companies, CompanyResource::class);
    }

    public function store(StoreCompanyRequest $request): JsonResponse
    {
        $company = $this->vehicleService->createCompany($request->validated());

        return $this->success(CompanyResource::make($company), 'تم إنشاء الشركة بنجاح.', 201);
    }

    public function show(Company $company): JsonResponse
    {
        $this->authorize('viewCompany', $company);
        $company->loadCount(['vehicles', 'customers']);

        return $this->success(CompanyResource::make($company));
    }

    public function update(StoreCompanyRequest $request, Company $company): JsonResponse
    {
        $this->authorize('manageCompanies', Vehicle::class);
        $company = $this->vehicleService->updateCompany($company, $request->validated());

        return $this->success(CompanyResource::make($company), 'تم تحديث الشركة بنجاح.');
    }
}
