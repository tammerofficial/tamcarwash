<?php

namespace App\Modules\Pricing\Policies;

use App\Models\TenantUser;
use App\Modules\Pricing\Models\Coupon;
use App\Modules\Pricing\Models\Discount;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Pricing\Models\PriceRule;
use App\Modules\Shared\Policies\HasModulePermission;

class PricingPolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'pricing.view');
    }

    public function managePriceRules(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'pricing.rules');
    }

    public function updatePriceRule(TenantUser $user, PriceRule $rule): bool
    {
        return $this->hasPermission($user, 'pricing.rules');
    }

    public function manageDiscounts(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'pricing.discounts');
    }

    public function updateDiscount(TenantUser $user, Discount $discount): bool
    {
        return $this->hasPermission($user, 'pricing.discounts');
    }

    public function manageCoupons(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'pricing.coupons');
    }

    public function updateCoupon(TenantUser $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'pricing.coupons');
    }

    public function managePeakHours(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'pricing.peak_hours');
    }

    public function updatePeakHour(TenantUser $user, PeakHourPricing $peakHour): bool
    {
        return $this->hasPermission($user, 'pricing.peak_hours');
    }
}
