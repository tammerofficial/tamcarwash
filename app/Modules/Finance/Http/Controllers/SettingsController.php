<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Support\BrandingHelper;
use App\Services\Landlord\TenantPlanService;
use App\Services\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends ApiController
{
    public function __construct(
        protected TenantPlanService $tenantPlanService,
    ) {}

    public function show(): JsonResponse
    {
        return $this->success($this->formatSettings());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => ['sometimes', 'string', 'max:255'],
            'tagline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'vat_enabled' => ['sometimes', 'boolean'],
            'vat_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'vat_inclusive' => ['sometimes', 'boolean'],
            'currency' => ['sometimes', 'string', 'max:3'],
            'timezone' => ['sometimes', 'string', 'max:64'],
            'primary_color' => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'secondary_color' => ['sometimes', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
            'logo' => ['sometimes', 'image', 'max:2048'],
        ]);

        $tenant = app(TenantContext::class)->get();

        if ($tenant) {
            $settings = $tenant->settings ?? [];

            if ($request->hasFile('logo')) {
                $path = $request->file('logo')->store("tenants/{$tenant->id}/branding", 'public');
                $settings['logo_url'] = asset("storage/{$path}");
            }

            if (isset($validated['primary_color'])) {
                $settings['primary_color'] = $validated['primary_color'];
            }

            if (isset($validated['secondary_color'])) {
                $settings['secondary_color'] = $validated['secondary_color'];
            }

            if (isset($validated['business_name'])) {
                $tenant->name = $validated['business_name'];
            }

            if (array_key_exists('tagline', $validated)) {
                $settings['tagline'] = $validated['tagline'];
            }

            $tenant->settings = $settings;
            $tenant->save();
        }

        $taxSettings = TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
        ]);

        $taxPayload = collect($validated)->only(['vat_enabled', 'vat_rate'])->all();

        if (array_key_exists('vat_inclusive', $validated)) {
            $taxPayload['prices_tax_inclusive'] = $validated['vat_inclusive'];
        }

        if ($taxPayload !== []) {
            $taxSettings->update($taxPayload);
        }

        return $this->success($this->formatSettings($taxSettings->fresh()), 'تم حفظ الإعدادات.');
    }

    protected function formatSettings(?TaxSetting $taxSettings = null): array
    {
        $taxSettings ??= TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
        ]);

        $tenant = app(TenantContext::class)->get();
        $settings = $tenant?->settings ?? [];

        $branding = BrandingHelper::resolve($settings, $tenant?->metadata ?? []);

        return [
            'business_name' => $tenant?->name ?? config('tammer.platform.name', 'تمير واش'),
            'tagline' => $branding['tagline'],
            'tenant_slug' => $tenant?->slug,
            'vat_enabled' => (bool) $taxSettings->vat_enabled,
            'vat_rate' => (float) $taxSettings->vat_rate,
            'vat_inclusive' => (bool) $taxSettings->prices_tax_inclusive,
            'currency' => config('tammer.vat.currency', 'OMR'),
            'timezone' => config('app.timezone', 'Asia/Muscat'),
            'primary_color' => $settings['primary_color'] ?? BrandingHelper::DEFAULT_PRIMARY,
            'secondary_color' => $settings['secondary_color'] ?? BrandingHelper::DEFAULT_SECONDARY,
            'logo_url' => $settings['logo_url'] ?? null,
            'plan' => $this->tenantPlanService->getPlanMeta($tenant),
        ];
    }
}
