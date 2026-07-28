<?php

namespace App\Modules\Pricing\Policies;

use App\Models\User;
use App\Modules\Pricing\Models\Coupon;
use App\Modules\Pricing\Models\Discount;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Pricing\Models\PriceRule;
use App\Modules\Shared\Policies\HasModulePermission;

class PricingPolicy
{
    use HasModulePermission;

    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'pricing.view');
    }

    public function managePriceRules(User $user): bool
    {
        return $this->hasPermission($user, 'pricing.rules');
    }

    public function updatePriceRule(User $user, PriceRule $rule): bool
    {
        return $this->hasPermission($user, 'pricing.rules');
    }

    public function manageDiscounts(User $user): bool
    {
        return $this->hasPermission($user, 'pricing.discounts');
    }

    public function updateDiscount(User $user, Discount $discount): bool
    {
        return $this->hasPermission($user, 'pricing.discounts');
    }

    public function manageCoupons(User $user): bool
    {
        return $this->hasPermission($user, 'pricing.coupons');
    }

    public function updateCoupon(User $user, Coupon $coupon): bool
    {
        return $this->hasPermission($user, 'pricing.coupons');
    }

    public function managePeakHours(User $user): bool
    {
        return $this->hasPermission($user, 'pricing.peak_hours');
    }

    public function updatePeakHour(User $user, PeakHourPricing $peakHour): bool
    {
        return $this->hasPermission($user, 'pricing.peak_hours');
    }
}
