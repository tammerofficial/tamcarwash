<?php

namespace App\Modules\Pricing\Services;

use App\Modules\Pricing\Models\Coupon;
use App\Modules\Pricing\Models\Discount;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Pricing\Models\PriceRule;
use App\Modules\Vehicles\Enums\VehicleType;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class PricingService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createPriceRule(array $data): PriceRule
    {
        return PriceRule::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createDiscount(array $data): Discount
    {
        return Discount::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createCoupon(array $data): Coupon
    {
        return Coupon::query()->create([
            ...$data,
            'code' => strtoupper($data['code']),
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createPeakHourPricing(array $data): PeakHourPricing
    {
        return PeakHourPricing::query()->create($data);
    }

    public function validateCoupon(string $code): Coupon
    {
        $coupon = Coupon::query()
            ->with('discount')
            ->where('code', strtoupper($code))
            ->where('is_active', true)
            ->first();

        if (! $coupon || ! $coupon->discount?->is_active) {
            throw new InvalidArgumentException('كود الخصم غير صالح.');
        }

        $discount = $coupon->discount;

        if ($discount->valid_from && now()->lt($discount->valid_from)) {
            throw new InvalidArgumentException('كود الخصم غير نشط بعد.');
        }

        if ($discount->valid_until && now()->gt($discount->valid_until)) {
            throw new InvalidArgumentException('كود الخصم منتهي الصلاحية.');
        }

        if ($coupon->max_uses && $coupon->used_count >= $coupon->max_uses) {
            throw new InvalidArgumentException('تم استنفاد استخدامات كود الخصم.');
        }

        return $coupon;
    }

    /**
     * Resolve applicable price rules for a service context.
     *
     * @return Collection<int, PriceRule>
     */
    public function resolvePriceRules(
        ?int $branchId = null,
        ?int $serviceId = null,
        ?VehicleType $vehicleType = null,
        ?int $companyId = null,
    ): Collection {
        return PriceRule::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query->whereNull('valid_from')->orWhere('valid_from', '<=', now());
            })
            ->where(function ($query) {
                $query->whereNull('valid_until')->orWhere('valid_until', '>=', now());
            })
            ->when($branchId, fn ($q) => $q->where(fn ($q2) => $q2->whereNull('branch_id')->orWhere('branch_id', $branchId)))
            ->when($serviceId, fn ($q) => $q->where(fn ($q2) => $q2->whereNull('service_id')->orWhere('service_id', $serviceId)))
            ->when($vehicleType, fn ($q) => $q->where(fn ($q2) => $q2->whereNull('vehicle_type')->orWhere('vehicle_type', $vehicleType)))
            ->when($companyId, fn ($q) => $q->where(fn ($q2) => $q2->whereNull('company_id')->orWhere('company_id', $companyId)))
            ->orderByDesc('priority')
            ->get();
    }

    public function getPeakHourSurcharge(int $branchId, int $dayOfWeek, string $time): ?PeakHourPricing
    {
        return PeakHourPricing::query()
            ->where('branch_id', $branchId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_active', true)
            ->where('starts_at', '<=', $time)
            ->where('ends_at', '>=', $time)
            ->first();
    }
}
