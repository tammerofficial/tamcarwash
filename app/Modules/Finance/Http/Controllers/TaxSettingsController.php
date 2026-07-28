<?php

namespace App\Modules\Finance\Http\Controllers;

use App\Modules\Finance\Models\TaxSetting;
use App\Modules\Shared\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TaxSettingsController extends ApiController
{
    public function show(): JsonResponse
    {
        $settings = TaxSetting::query()->first();

        return $this->success($settings);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'vat_enabled' => ['sometimes', 'boolean'],
            'vat_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'prices_tax_inclusive' => ['sometimes', 'boolean'],
            'vatin' => ['nullable', 'string', 'max:32'],
            'cr_number' => ['nullable', 'string', 'max:32'],
            'legal_name_ar' => ['nullable', 'string', 'max:255'],
            'legal_name_en' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
        ]);

        $settings = TaxSetting::query()->firstOrCreate([], [
            'vat_enabled' => true,
            'vat_rate' => config('tammer.vat.default_rate', 5),
            'prices_tax_inclusive' => false,
        ]);

        $settings->update($validated);

        return $this->success($settings->fresh(), 'تم تحديث إعدادات الضريبة');
    }
}
