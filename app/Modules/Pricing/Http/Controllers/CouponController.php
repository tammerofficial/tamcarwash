<?php

namespace App\Modules\Pricing\Http\Controllers;

use App\Modules\Pricing\Http\Requests\StoreCouponRequest;
use App\Modules\Pricing\Http\Requests\UpdateCouponRequest;
use App\Modules\Pricing\Http\Resources\CouponResource;
use App\Modules\Pricing\Models\Coupon;
use App\Modules\Pricing\Services\PricingService;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Modules\Shared\Http\Concerns\PaginatesApiResources;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CouponController extends ApiController
{
    use PaginatesApiResources;

    public function __construct(
        protected PricingService $pricingService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);

        $query = Coupon::query()
            ->with('discount')
            ->latest();

        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where('code', 'like', "%{$search}%");
        }

        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        return $this->paginatedResourceResponse(
            $query->paginate($request->integer('per_page', 20)),
            CouponResource::class,
        );
    }

    public function store(StoreCouponRequest $request): JsonResponse
    {
        $coupon = $this->pricingService->createCoupon($request->validated());

        return $this->success(
            CouponResource::make($coupon->load('discount')),
            'تم إنشاء كود الخصم.',
            201,
        );
    }

    public function show(Coupon $coupon): JsonResponse
    {
        $this->authorize('viewAny', Coupon::class);

        $coupon->load('discount');

        return $this->success(CouponResource::make($coupon));
    }

    public function update(UpdateCouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['code'])) {
            $data['code'] = strtoupper($data['code']);
        }

        $coupon->update($data);

        return $this->success(CouponResource::make($coupon->fresh('discount')), 'تم تحديث كود الخصم.');
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $this->authorize('updateCoupon', $coupon);

        $coupon->delete();

        return $this->success(null, 'تم حذف كود الخصم.');
    }

    public function validate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        try {
            $coupon = $this->pricingService->validateCoupon($validated['code']);

            return $this->success(CouponResource::make($coupon->load('discount')));
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }
}
