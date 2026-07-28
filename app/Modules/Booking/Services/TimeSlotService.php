<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Models\TimeSlot;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TimeSlotService
{
    public function getAvailableSlots(int $branchId, Carbon $date): array
    {
        return TimeSlot::query()
            ->where('branch_id', $branchId)
            ->whereDate('slot_date', $date)
            ->where('is_available', true)
            ->whereColumn('booked_count', '<', 'capacity')
            ->orderBy('start_time')
            ->get()
            ->filter(fn (TimeSlot $slot) => $slot->hasCapacity())
            ->values()
            ->all();
    }

    public function reserveSlot(int $timeSlotId): TimeSlot
    {
        return DB::transaction(function () use ($timeSlotId) {
            $slot = TimeSlot::query()->lockForUpdate()->findOrFail($timeSlotId);

            if (! $slot->hasCapacity()) {
                throw new RuntimeException('الموعد محجوز بالكامل.');
            }

            $slot->increment('booked_count');

            if ($slot->booked_count >= $slot->capacity) {
                $slot->update(['is_available' => false]);
            }

            return $slot->fresh();
        });
    }

    public function releaseSlot(?int $timeSlotId): void
    {
        if (! $timeSlotId) {
            return;
        }

        DB::transaction(function () use ($timeSlotId) {
            $slot = TimeSlot::query()->lockForUpdate()->find($timeSlotId);

            if (! $slot || $slot->booked_count <= 0) {
                return;
            }

            $slot->decrement('booked_count');
            $slot->update(['is_available' => true]);
        });
    }

    /**
     * @param  array<int, array{start_time: string, end_time: string, capacity?: int}>  $slots
     */
    public function generateSlots(int $branchId, Carbon $date, array $slots): int
    {
        $created = 0;

        foreach ($slots as $slot) {
            TimeSlot::query()->updateOrCreate(
                [
                    'branch_id' => $branchId,
                    'slot_date' => $date->toDateString(),
                    'start_time' => $slot['start_time'],
                ],
                [
                    'end_time' => $slot['end_time'],
                    'capacity' => $slot['capacity'] ?? 1,
                    'booked_count' => 0,
                    'is_available' => true,
                ]
            );
            $created++;
        }

        return $created;
    }
}
