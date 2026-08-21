<?php

use App\Http\Controllers\Landlord\DashboardController;
use App\Http\Controllers\Landlord\PlanController;
use App\Http\Controllers\Landlord\PlatformAuthController;
use App\Http\Controllers\Landlord\PlatformSettingsController;
use App\Http\Controllers\Landlord\SubscriptionController;
use App\Http\Controllers\Landlord\TenantManagementController;
use App\Http\Controllers\Landlord\TenantRegistrationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Landlord (Platform) API Routes
|--------------------------------------------------------------------------
|
| Platform administration, tenant management, billing, and platform auth.
| Uses landlord database connection and platform Sanctum guard.
|
*/

Route::get('/health', fn () => response()->json([
    'status' => 'ok',
    'context' => 'landlord',
]));

Route::post('/tenants/register', [TenantRegistrationController::class, 'register'])
    ->middleware('throttle:5,1');

Route::get('/plans', [PlanController::class, 'index']);

Route::prefix('auth')->group(function () {
    Route::post('login', [PlatformAuthController::class, 'login']);
    Route::middleware('auth:platform')->group(function () {
        Route::post('logout', [PlatformAuthController::class, 'logout']);
        Route::get('user', [PlatformAuthController::class, 'user']);
    });
});

Route::middleware('auth:platform')->group(function () {
    Route::get('/me', [PlatformAuthController::class, 'user']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    Route::get('/tenants', [TenantManagementController::class, 'index']);
    Route::post('/tenants', [TenantManagementController::class, 'store']);
    Route::get('/tenants/{tenant}', [TenantManagementController::class, 'show']);
    Route::patch('/tenants/{tenant}', [TenantManagementController::class, 'update']);
    Route::delete('/tenants/{tenant}', [TenantManagementController::class, 'destroy']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);
    Route::get('/subscriptions/{subscription}', [SubscriptionController::class, 'show']);
    Route::patch('/subscriptions/{subscription}', [SubscriptionController::class, 'update']);
    Route::post('/subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel']);
    Route::post('/subscriptions/{subscription}/reactivate', [SubscriptionController::class, 'reactivate']);

    Route::post('/plans', [PlanController::class, 'store']);
    Route::get('/plans/{plan}', [PlanController::class, 'show']);
    Route::patch('/plans/{plan}', [PlanController::class, 'update']);
    Route::delete('/plans/{plan}', [PlanController::class, 'destroy']);

    Route::get('/settings', [PlatformSettingsController::class, 'show']);
    Route::put('/settings', [PlatformSettingsController::class, 'update']);
});

Route::prefix('admin')->middleware(['auth:platform', 'tenant.admin'])->group(function () {
    // Platform admin acting on behalf of a tenant via X-Tenant-Id header
});
