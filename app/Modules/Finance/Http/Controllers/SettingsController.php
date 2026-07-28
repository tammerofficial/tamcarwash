<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Shared\Http\Controllers\ApiController;
use App\Services\Tenancy\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController extends ApiController
{
    public function show(): JsonResponse
    {
        return $this->success($this->formatSettings());
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => ['sometimes', 'string', 'max:255'],
            'vat_enabled' => ['sometimes', 'boolean'],
            'vat_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'vat_inclusive' => ['sometimes', 'boolean'],
            'currency' => ['sometimes', 'string', 'max:3'],
            'timezone' => ['sometimes', 'string', 'max:64'],
        ]);

        $settings = TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
        ]);

        $taxPayload = collect($validated)->only(['vat_enabled', 'vat_rate'])->all();

        if (array_key_exists('vat_inclusive', $validated)) {
            $taxPayload['prices_tax_inclusive'] = $validated['vat_inclusive'];
        }

        if ($taxPayload !== []) {
            $settings->update($taxPayload);
        }

        return $this->success($this->formatSettings($settings->fresh()), 'تم حفظ الإعدادات.');
    }

    protected function formatSettings(?TaxSetting $settings = null): array
    {
        $settings ??= TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
        ]);

        $tenant = app(TenantContext::class)->get();

        return [
            'business_name' => $tenant?->name ?? config('app.name'),
            'vat_enabled' => (bool) $settings->vat_enabled,
            'vat_rate' => (float) $settings->vat_rate,
            'vat_inclusive' => (bool) $settings->prices_tax_inclusive,
            'currency' => config('tammer.vat.currency', 'OMR'),
            'timezone' => config('app.timezone', 'Asia/Muscat'),
        ];
    }
}
