<?php

namespace App\Modules\Customers\Http\Controllers;

use App\Modules\Customers\Enums\LoyaltyPointType;
use App\Modules\Customers\Http\Requests\StoreCustomerNoteRequest;
use App\Modules\Customers\Http\Requests\StoreCustomerRequest;
use App\Modules\Customers\Http\Requests\UpdateCustomerRequest;
use App\Modules\Customers\Http\Resources\CustomerNoteResource;
use App\Modules\Customers\Http\Resources\CustomerResource;
use App\Modules\Customers\Http\Resources\LoyaltyPointResource;
use App\Modules\Customers\Models\Customer;
use App\Modules\Customers\Services\CustomerService;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CustomerController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected CustomerService $customerService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Customer::class);

        $query = Customer::query()
            ->with(['company'])
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            CustomerResource::class,
        );
    }

    public function store(StoreCustomerRequest $request): JsonResponse
    {
        $customer = $this->customerService->create($request->validated());

        return $this->success(
            CustomerResource::make($customer->load('company')),
            'تم إنشاء العميل بنجاح.',
            201,
        );
    }

    public function show(Customer $customer): JsonResponse
    {
        $this->authorize('view', $customer);

        $customer->load(['company', 'notes', 'vehicles']);

        return $this->success(CustomerResource::make($customer));
    }

    public function update(UpdateCustomerRequest $request, Customer $customer): JsonResponse
    {
        $customer = $this->customerService->update($customer, $request->validated());

        return $this->success(CustomerResource::make($customer), 'تم تحديث العميل.');
    }

    public function destroy(Customer $customer): JsonResponse
    {
        $this->authorize('delete', $customer);

        $customer->delete();

        return $this->success(null, 'تم حذف العميل.');
    }

    public function blacklist(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $customer = $this->customerService->blacklist(
            $customer,
            $request->string('reason')->toString() ?: null,
        );

        return $this->success(CustomerResource::make($customer), 'تم إدراج العميل في القائمة السوداء.');
    }

    public function activate(Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $customer = $this->customerService->activate($customer);

        return $this->success(CustomerResource::make($customer), 'تم تفعيل العميل.');
    }

    public function deactivate(Customer $customer): JsonResponse
    {
        $this->authorize('update', $customer);

        $customer = $this->customerService->deactivate($customer);

        return $this->success(CustomerResource::make($customer), 'تم إيقاف العميل.');
    }

    public function storeNote(StoreCustomerNoteRequest $request, Customer $customer): JsonResponse
    {
        $note = $this->customerService->addNote(
            $customer,
            $request->validated(),
            $request->user()?->id,
        );

        return $this->success(
            CustomerNoteResource::make($note),
            'تم إضافة الملاحظة.',
            201,
        );
    }

    public function adjustLoyalty(Request $request, Customer $customer): JsonResponse
    {
        $this->authorize('manageLoyalty', $customer);

        $validated = $request->validate([
            'points' => ['required', 'integer'],
            'type' => ['required', 'in:earn,redeem,adjust'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        try {
            $entry = $this->customerService->adjustLoyaltyPoints(
                $customer,
                $validated['points'],
                LoyaltyPointType::from($validated['type']),
                $validated['description'] ?? null,
            );

            return $this->success(
                LoyaltyPointResource::make($entry),
                'تم تعديل نقاط الولاء.',
                201,
            );
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
