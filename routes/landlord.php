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
    Route::get('/tenants/{tenant}', [TenantManagementController::class, 'show']);
    Route::patch('/tenants/{tenant}', [TenantManagementController::class, 'update']);

    Route::get('/plans', [PlanController::class, 'index']);

    Route::get('/subscriptions', [SubscriptionController::class, 'index']);

    Route::get('/settings', [PlatformSettingsController::class, 'show']);
    Route::put('/settings', [PlatformSettingsController::class, 'update']);
});

Route::prefix('admin')->middleware(['auth:platform', 'tenant.admin'])->group(function () {
    // Platform admin acting on behalf of a tenant via X-Tenant-Id header
});
