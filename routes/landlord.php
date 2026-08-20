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

Route::get('/health', function () {
    $checks = [
        'status' => 'ok',
        'context' => 'landlord',
        'env' => app()->environment(),
        'debug' => (bool) config('app.debug'),
        'config_cached' => app()->configurationIsCached(),
        'app_key_present' => filled(config('app.key')),
        'session_driver' => config('session.driver'),
        'cache_store' => config('cache.default'),
        'queue_connection' => config('queue.default'),
        'php' => PHP_VERSION,
    ];

    try {
        \Illuminate\Support\Facades\DB::connection('landlord')->select('select 1');
        $checks['db_landlord'] = 'ok';
    } catch (\Throwable $e) {
        $checks['db_landlord'] = 'fail';
        $checks['db_landlord_error'] = $e->getMessage();
        $checks['status'] = 'degraded';
    }

    try {
        $checks['session_handler'] = get_class(app('session')->driver());
    } catch (\Throwable $e) {
        $checks['session_handler'] = 'fail: '.$e->getMessage();
        $checks['status'] = 'degraded';
    }

    $checks['sessions_dir_writable'] = is_writable(storage_path('framework/sessions'));
    $checks['logs_writable'] = is_writable(storage_path('logs'));

    return response()->json($checks, $checks['status'] === 'ok' ? 200 : 500);
});

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
