<?php

namespace App\Modules\Branches\Services;

use App\Modules\Branches\Enums\BranchStatus;
use App\Modules\Branches\Models\Branch;
use App\Modules\Branches\Models\BranchHoliday;
use App\Modules\Branches\Models\WashBay;
use App\Modules\Branches\Models\WorkingHour;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class BranchService
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Branch
    {
        return DB::transaction(function () use ($data) {
            $branch = Branch::query()->create([
                'name' => $data['name'],
                'code' => $data['code'] ?? Str::upper(Str::slug($data['name'], '')),
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'status' => $data['status'] ?? BranchStatus::Active,
                'capacity_per_hour' => $data['capacity_per_hour'] ?? 10,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'is_active' => $data['is_active'] ?? true,
            ]);

            if (! empty($data['working_hours'])) {
                $this->syncWorkingHours($branch, $data['working_hours']);
            } else {
                $this->seedDefaultWorkingHours($branch);
            }

            return $branch->fresh(['workingHours', 'washBays', 'holidays']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Branch $branch, array $data): Branch
    {
        return DB::transaction(function () use ($branch, $data) {
            $branch->update(collect($data)->only([
                'name', 'code', 'address', 'city', 'phone', 'email',
                'status', 'capacity_per_hour', 'latitude', 'longitude', 'is_active',
            ])->filter(fn ($v) => $v !== null)->all());

            if (array_key_exists('working_hours', $data)) {
                $this->syncWorkingHours($branch, $data['working_hours'] ?? []);
            }

            return $branch->fresh(['workingHours', 'washBays', 'holidays']);
        });
    }

    /**
     * @param  array<int, array<string, mixed>>  $hours
     */
    public function syncWorkingHours(Branch $branch, array $hours): void
    {
        $branch->workingHours()->delete();

        foreach ($hours as $hour) {
            WorkingHour::query()->create([
                'branch_id' => $branch->id,
                'day_of_week' => $hour['day_of_week'],
                'opens_at' => $hour['opens_at'] ?? null,
                'closes_at' => $hour['closes_at'] ?? null,
                'is_closed' => $hour['is_closed'] ?? false,
            ]);
        }
    }

    public function addHoliday(Branch $branch, array $data): BranchHoliday
    {
        return $branch->holidays()->create([
            'date' => $data['date'],
            'name' => $data['name'],
            'is_closed' => $data['is_closed'] ?? true,
        ]);
    }

    public function addWashBay(Branch $branch, array $data): WashBay
    {
        $bay = $branch->washBays()->create([
            'name' => $data['name'],
            'bay_number' => $data['bay_number'],
            'status' => $data['status'] ?? 'available',
            'is_active' => $data['is_active'] ?? true,
        ]);

        $this->syncCapacityFromBays($branch);

        return $bay;
    }

    public function syncCapacityFromBays(Branch $branch): void
    {
        $activeBays = $branch->washBays()->where('is_active', true)->count();

        if ($activeBays > 0) {
            $branch->update(['capacity_per_hour' => $activeBays]);
        }
    }

    protected function seedDefaultWorkingHours(Branch $branch): void
    {
        for ($day = 0; $day <= 6; $day++) {
            WorkingHour::query()->create([
                'branch_id' => $branch->id,
                'day_of_week' => $day,
                'opens_at' => '08:00:00',
                'closes_at' => '22:00:00',
                'is_closed' => $day === 5,
            ]);
        }
    }

    public function getCapacitySummary(Branch $branch): array
    {
        return [
            'capacity_per_hour' => $branch->capacity_per_hour,
            'active_wash_bays' => $branch->activeWashBayCount(),
            'total_wash_bays' => $branch->washBays()->count(),
        ];
    }
}
