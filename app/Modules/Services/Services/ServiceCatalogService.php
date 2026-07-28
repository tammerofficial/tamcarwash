<?php

namespace App\Modules\Services\Services;

use App\Modules\Services\Models\Service;
use App\Modules\Services\Models\ServiceAddon;
use App\Modules\Services\Models\ServiceCategory;
use App\Modules\Services\Models\ServiceConsumable;
use App\Modules\Services\Models\ServiceVehicleTypePrice;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ServiceCatalogService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function createCategory(array $data): ServiceCategory
    {
        return ServiceCategory::query()->create([
            'name' => $data['name'],
            'name_ar' => $data['name_ar'] ?? null,
            'slug' => $data['slug'] ?? Str::slug($data['name']),
            'sort_order' => $data['sort_order'] ?? 0,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function createService(array $data): Service
    {
        return DB::transaction(function () use ($data) {
            $service = Service::query()->create([
                'category_id' => $data['category_id'],
                'name' => $data['name'],
                'name_ar' => $data['name_ar'] ?? null,
                'slug' => $data['slug'] ?? Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'duration_minutes' => $data['duration_minutes'] ?? 30,
                'base_price' => $data['base_price'] ?? 0,
                'vat_included' => $data['vat_included'] ?? false,
                'vat_rate' => $data['vat_rate'] ?? 15,
                'sort_order' => $data['sort_order'] ?? 0,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['branch_ids'])) {
                $this->syncBranchAvailability($service, $data['branch_ids']);
            }

            if (! empty($data['vehicle_type_prices'])) {
                $this->syncVehicleTypePrices($service, $data['vehicle_type_prices']);
            }

            if (! empty($data['consumables'])) {
                $this->syncConsumables($service, $data['consumables']);
            }

            return $service->fresh(['category', 'addons', 'vehicleTypePrices', 'consumables', 'branches']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function updateService(Service $service, array $data): Service
    {
        return DB::transaction(function () use ($service, $data) {
            $service->update(collect($data)->only([
                'category_id', 'name', 'name_ar', 'slug', 'description',
                'duration_minutes', 'base_price', 'vat_included', 'vat_rate', 'sort_order', 'is_active',
            ])->filter(fn ($v) => $v !== null)->all());

            if (array_key_exists('branch_ids', $data)) {
                $this->syncBranchAvailability($service, $data['branch_ids'] ?? []);
            }

            if (array_key_exists('vehicle_type_prices', $data)) {
                $this->syncVehicleTypePrices($service, $data['vehicle_type_prices'] ?? []);
            }

            if (array_key_exists('consumables', $data)) {
                $this->syncConsumables($service, $data['consumables'] ?? []);
            }

            return $service->fresh(['category', 'addons', 'vehicleTypePrices', 'consumables', 'branches']);
        });
    }

    public function addAddon(Service $service, array $data): ServiceAddon
    {
        return $service->addons()->create([
            'name' => $data['name'],
            'name_ar' => $data['name_ar'] ?? null,
            'price' => $data['price'] ?? 0,
            'duration_minutes' => $data['duration_minutes'] ?? 0,
            'vat_included' => $data['vat_included'] ?? false,
            'is_active' => $data['is_active'] ?? true,
        ]);
    }

    /**
     * @param  array<int, array<string, mixed>>  $branchData
     */
    public function syncBranchAvailability(Service $service, array $branchData): void
    {
        $sync = [];

        foreach ($branchData as $item) {
            $branchId = is_array($item) ? $item['branch_id'] : $item;
            $sync[$branchId] = [
                'is_available' => is_array($item) ? ($item['is_available'] ?? true) : true,
                'custom_price' => is_array($item) ? ($item['custom_price'] ?? null) : null,
                'custom_duration' => is_array($item) ? ($item['custom_duration'] ?? null) : null,
            ];
        }

        $service->branches()->sync($sync);
    }

    /**
     * @param  array<int, array<string, mixed>>  $prices
     */
    public function syncVehicleTypePrices(Service $service, array $prices): void
    {
        $service->vehicleTypePrices()->delete();

        foreach ($prices as $price) {
            ServiceVehicleTypePrice::query()->create([
                'service_id' => $service->id,
                'vehicle_type' => $price['vehicle_type'],
                'price' => $price['price'],
            ]);
        }
    }

    /**
     * @param  array<int, array<string, mixed>>  $consumables
     */
    public function syncConsumables(Service $service, array $consumables): void
    {
        $service->consumables()->delete();

        foreach ($consumables as $item) {
            ServiceConsumable::query()->create([
                'service_id' => $service->id,
                'name' => $item['name'],
                'quantity' => $item['quantity'] ?? 1,
                'unit' => $item['unit'] ?? 'unit',
            ]);
        }
    }
}
