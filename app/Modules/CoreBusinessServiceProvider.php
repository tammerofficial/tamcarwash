<?php

namespace App\Modules;

use App\Modules\Branches\Models\Branch;
use App\Modules\Branches\Models\WashBay;
use App\Modules\Branches\Observers\WashBayObserver;
use App\Modules\Branches\Policies\BranchPolicy;
use App\Modules\Customers\Models\Customer;
use App\Modules\Customers\Models\LoyaltyPoint;
use App\Modules\Customers\Observers\LoyaltyPointObserver;
use App\Modules\Customers\Policies\CustomerPolicy;
use App\Modules\Pricing\Models\Coupon;
use App\Modules\Pricing\Models\Discount;
use App\Modules\Pricing\Models\PeakHourPricing;
use App\Modules\Pricing\Models\PriceRule;
use App\Modules\Pricing\Policies\PricingPolicy;
use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Services\Policies\ServicePolicy;
use App\Modules\Vehicles\Models\Company;
use App\Modules\Vehicles\Models\Vehicle;
use App\Modules\Vehicles\Policies\VehiclePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class CoreBusinessServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(Branch::class, BranchPolicy::class);
        Gate::policy(Customer::class, CustomerPolicy::class);
        Gate::policy(Vehicle::class, VehiclePolicy::class);
        Gate::policy(Company::class, VehiclePolicy::class);
        Gate::policy(Service::class, ServicePolicy::class);
        Gate::policy(ServiceCategory::class, ServicePolicy::class);
        Gate::policy(PriceRule::class, PricingPolicy::class);
        Gate::policy(Discount::class, PricingPolicy::class);
        Gate::policy(Coupon::class, PricingPolicy::class);
        Gate::policy(PeakHourPricing::class, PricingPolicy::class);

        LoyaltyPoint::observe(LoyaltyPointObserver::class);
        WashBay::observe(WashBayObserver::class);
    }
}
