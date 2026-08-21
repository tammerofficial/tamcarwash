<?php

use App\Modules\Booking\Http\Controllers\BookingController;
use App\Modules\Booking\Http\Controllers\TimeSlotController;
use App\Modules\Branches\Http\Controllers\BranchController;
use App\Modules\Customers\Http\Controllers\CustomerController;
use App\Modules\Finance\Http\Controllers\CashDrawerController;
use App\Modules\Finance\Http\Controllers\ExpenseController;
use App\Modules\Finance\Http\Controllers\InvoiceController;
use App\Modules\Finance\Http\Controllers\PaymentController;
use App\Modules\Finance\Http\Controllers\PaymentMethodController;
use App\Modules\Finance\Http\Controllers\SettingsController;
use App\Modules\Finance\Http\Controllers\TaxReportController;
use App\Modules\Finance\Http\Controllers\TaxSettingsController;
use App\Modules\Orders\Http\Controllers\OrderController;
use App\Modules\Pricing\Http\Controllers\CouponController;
use App\Modules\Pricing\Http\Controllers\DiscountController;
use App\Modules\Pricing\Http\Controllers\PeakHourPricingController;
use App\Modules\Pricing\Http\Controllers\PriceRuleController;
use App\Modules\Queue\Http\Controllers\QueueController;
use App\Modules\Services\Http\Controllers\ServiceCategoryController;
use App\Modules\Services\Http\Controllers\ServiceController;
use App\Modules\Shared\Http\Controllers\DashboardController;
use App\Modules\Shared\Http\Controllers\StorefrontController;
use App\Modules\Shared\Http\Controllers\TenantAuthController;
use App\Modules\Vehicles\Http\Controllers\CompanyController;
use App\Modules\Vehicles\Http\Controllers\VehicleController;
use App\Services\Tenancy\TenantContext;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Tenant API Routes  (/api/v1/*)
|--------------------------------------------------------------------------
|
| Tenant-scoped business API. Requires tenant context via subdomain,
| custom domain, X-Tenant-Id / X-Tenant-Slug header, or local default.
|
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'context' => 'tenant',
    'tenant' => app(TenantContext::class)->get()?->only(['id', 'slug', 'name']),
]));

Route::prefix('auth')->group(function () {
    Route::post('login', [TenantAuthController::class, 'login']);

    Route::middleware('auth:tenant')->group(function () {
        Route::post('logout', [TenantAuthController::class, 'logout']);
        Route::get('user', [TenantAuthController::class, 'user']);
    });
});

Route::get('queue/screen/public', [QueueController::class, 'publicScreen']);
Route::get('orders/screen/public', [OrderController::class, 'publicScreen']);

Route::get('branding.json', [StorefrontController::class, 'brandingJson']);

Route::prefix('storefront')->group(function () {
    Route::get('/', [StorefrontController::class, 'show']);
    Route::get('branding', [StorefrontController::class, 'branding']);
    Route::get('services', [StorefrontController::class, 'services']);
    Route::get('branches', [StorefrontController::class, 'branches']);
    Route::get('time-slots/available', [StorefrontController::class, 'availableTimeSlots']);
    Route::post('bookings', [StorefrontController::class, 'storeBooking']);
    Route::get('queue-status', [StorefrontController::class, 'queueStatus']);
    Route::get('track', [StorefrontController::class, 'trackOrder']);
});

Route::middleware('auth:tenant')->group(function () {
    Route::get('/me', fn () => response()->json([
        'user' => auth('tenant')->user(),
        'context' => 'tenant',
        'tenant' => app(TenantContext::class)->get()?->only(['id', 'slug', 'name']),
    ]));

    Route::get('dashboard/stats', [DashboardController::class, 'stats']);

    Route::apiResource('branches', BranchController::class);
    Route::get('branches/{branch}/capacity', [BranchController::class, 'capacity']);
    Route::post('branches/{branch}/holidays', [BranchController::class, 'storeHoliday']);
    Route::post('branches/{branch}/wash-bays', [BranchController::class, 'storeWashBay']);

    Route::apiResource('customers', CustomerController::class);
    Route::post('customers/{customer}/blacklist', [CustomerController::class, 'blacklist']);
    Route::post('customers/{customer}/activate', [CustomerController::class, 'activate']);
    Route::post('customers/{customer}/deactivate', [CustomerController::class, 'deactivate']);
    Route::post('customers/{customer}/notes', [CustomerController::class, 'storeNote']);
    Route::post('customers/{customer}/loyalty-points', [CustomerController::class, 'adjustLoyalty']);

    Route::apiResource('vehicles', VehicleController::class);
    Route::apiResource('companies', CompanyController::class)->except(['destroy']);

    Route::apiResource('service-categories', ServiceCategoryController::class)->only(['index', 'store', 'show']);
    Route::apiResource('services', ServiceController::class);

    Route::prefix('pricing')->group(function () {
        Route::get('rules', [PriceRuleController::class, 'index']);
        Route::post('rules', [PriceRuleController::class, 'store']);
        Route::get('discounts', [DiscountController::class, 'index']);
        Route::post('discounts', [DiscountController::class, 'store']);
        Route::get('coupons', [CouponController::class, 'index']);
        Route::post('coupons', [CouponController::class, 'store']);
        Route::post('coupons/validate', [CouponController::class, 'validate']);
        Route::get('peak-hours', [PeakHourPricingController::class, 'index']);
        Route::post('peak-hours', [PeakHourPricingController::class, 'store']);
    });

    Route::prefix('time-slots')->group(function () {
        Route::get('available', [TimeSlotController::class, 'available']);
        Route::post('generate', [TimeSlotController::class, 'generate']);
    });

    Route::get('bookings', [BookingController::class, 'index']);
    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::post('bookings/{booking}/confirm', [BookingController::class, 'confirm']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::post('bookings/{booking}/reschedule', [BookingController::class, 'reschedule']);
    Route::post('bookings/{booking}/complete', [BookingController::class, 'complete']);
    Route::post('bookings/{booking}/convert-to-order', [BookingController::class, 'convertToOrder']);

    Route::prefix('queue')->group(function () {
        Route::get('entries', [QueueController::class, 'index']);
        Route::post('entries/walk-in', [QueueController::class, 'storeWalkIn']);
        Route::post('entries/from-booking/{booking}', [QueueController::class, 'storeFromBooking']);
        Route::get('entries/{queueEntry}', [QueueController::class, 'show']);
        Route::patch('entries/{queueEntry}/status', [QueueController::class, 'updateStatus']);
        Route::post('call-next', [QueueController::class, 'callNext']);
        Route::get('estimated-wait', [QueueController::class, 'estimatedWait']);
        Route::get('screen', [QueueController::class, 'screen']);
        Route::get('analytics', [QueueController::class, 'analytics']);
    });

    Route::get('orders', [OrderController::class, 'index']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::get('orders/screen', [OrderController::class, 'screen']);
    Route::get('orders/{order}', [OrderController::class, 'show']);
    Route::post('orders/{order}/transition', [OrderController::class, 'transition']);
    Route::post('orders/{order}/assign-worker', [OrderController::class, 'assignWorker']);
    Route::post('orders/{order}/items', [OrderController::class, 'addItem']);

    Route::get('invoices', [InvoiceController::class, 'index']);
    Route::get('invoices/{invoice}', [InvoiceController::class, 'show']);
    Route::post('orders/{order}/invoice', [InvoiceController::class, 'storeFromOrder']);
    Route::post('invoices/{invoice}/void', [InvoiceController::class, 'void']);
    Route::get('invoices/{invoice}/pdf', [InvoiceController::class, 'pdf']);

    Route::get('payments', [PaymentController::class, 'index']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::get('payment-methods', [PaymentMethodController::class, 'index']);

    Route::get('expenses', [ExpenseController::class, 'index']);
    Route::post('expenses', [ExpenseController::class, 'store']);

    Route::get('cash-drawer/current', [CashDrawerController::class, 'current']);
    Route::post('cash-drawer/open', [CashDrawerController::class, 'open']);
    Route::post('cash-drawer/{session}/close', [CashDrawerController::class, 'close']);

    Route::get('settings', [SettingsController::class, 'show']);
    Route::put('settings', [SettingsController::class, 'update']);

    Route::get('tax-settings', [TaxSettingsController::class, 'show']);
    Route::put('tax-settings', [TaxSettingsController::class, 'update']);

    Route::get('tax-reports', [TaxReportController::class, 'summary']);
    Route::prefix('tax-reports')->group(function () {
        Route::get('daily', [TaxReportController::class, 'daily']);
        Route::get('monthly', [TaxReportController::class, 'monthly']);
        Route::get('quarterly', [TaxReportController::class, 'quarterly']);
        Route::get('breakdown', [TaxReportController::class, 'breakdown']);
    });
});
