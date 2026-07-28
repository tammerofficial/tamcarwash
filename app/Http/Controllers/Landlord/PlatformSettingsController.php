<?php

namespace App\Http\Controllers\Landlord;

use App\Modules\Shared\Http\Controllers\ApiController;
use App\Services\Landlord\PlatformSettingsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformSettingsController extends ApiController
{
    public function __construct(
        protected PlatformSettingsService $settings,
    ) {}

    public function show(): JsonResponse
    {
        return $this->success($this->settings->all());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'platform_name' => ['sometimes', 'string', 'max:255'],
            'platform_domain' => ['sometimes', 'string', 'max:255'],
            'tenancy_mode' => ['sometimes', 'in:subdirectory,subdomain'],
            'trial_days' => ['sometimes', 'integer', 'min:0', 'max:365'],
            'support_email' => ['sometimes', 'nullable', 'email', 'max:255'],
        ]);

        $updated = $this->settings->update($validated);
        $this->settings->applyTenancyConfig();

        return $this->success($updated, 'تم حفظ إعدادات المنصة.');
    }
}
