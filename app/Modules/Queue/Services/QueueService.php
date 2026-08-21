<?php

namespace App\Modules\Queue\Services;

use App\Modules\Booking\Models\Booking;
use App\Modules\Branches\Models\Branch;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Enums\QueueSource;
use App\Modules\Queue\Events\QueueEntryCalled;
use App\Modules\Queue\Events\QueueEntryCreated;
use App\Modules\Queue\Events\QueueEntryStatusChanged;
use App\Modules\Queue\Jobs\SendQueueNotificationJob;
use App\Modules\Queue\Models\QueueEntry;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class QueueService
{
    protected int $averageServiceMinutes;

    public function __construct()
    {
        $this->averageServiceMinutes = (int) config('tammer.queue.average_service_minutes', 25);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function addWalkIn(array $data): QueueEntry
    {
        return $this->createEntry(array_merge($data, [
            'source' => QueueSource::WalkIn,
            'priority' => $data['priority'] ?? 0,
        ]));
    }

    public function addFromBooking(Booking $booking): QueueEntry
    {
        if ($booking->queueEntry) {
            throw new RuntimeException('يوجد طابور مرتبط بهذا الحجز بالفعل.');
        }

        return $this->createEntry([
            'branch_id' => $booking->branch_id,
            'source' => QueueSource::Booked,
            'booking_id' => $booking->id,
            'customer_id' => $booking->customer_id,
            'vehicle_id' => $booking->vehicle_id,
            'priority' => 10,
            'notes' => "حجز #{$booking->booking_number}",
        ]);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    protected function createEntry(array $data): QueueEntry
    {
        return DB::transaction(function () use ($data) {
            $date = isset($data['queue_date'])
                ? Carbon::parse($data['queue_date'])
                : now();

            $queueNumber = $this->nextQueueNumber((int) $data['branch_id'], $date);
            $estimatedWait = $this->calculateEstimatedWait((int) $data['branch_id'], $date);

            $entry = QueueEntry::query()->create([
                'branch_id' => $data['branch_id'],
                'queue_number' => $queueNumber,
                'queue_date' => $date->toDateString(),
                'source' => $data['source'],
                'booking_id' => $data['booking_id'] ?? null,
                'order_id' => $data['order_id'] ?? null,
                'customer_id' => $data['customer_id'] ?? null,
                'vehicle_id' => $data['vehicle_id'] ?? null,
                'status' => QueueEntryStatus::Waiting,
                'estimated_wait_minutes' => $estimatedWait,
                'priority' => $data['priority'] ?? 0,
                'notes' => $data['notes'] ?? null,
            ]);

            QueueEntryCreated::dispatch($entry);

            return $entry->fresh(['customer', 'vehicle', 'booking']);
        });
    }

    public function callNext(int $branchId, ?Carbon $date = null): ?QueueEntry
    {
        $date = $date ?? now();

        $entry = QueueEntry::query()
            ->where('branch_id', $branchId)
            ->whereDate('queue_date', $date)
            ->where('status', QueueEntryStatus::Waiting)
            ->orderByDesc('priority')
            ->orderBy('queue_number')
            ->lockForUpdate()
            ->first();

        if (! $entry) {
            return null;
        }

        return $this->updateStatus($entry, QueueEntryStatus::Arrived, [
            'called_at' => now(),
        ], notify: true, notifyType: 'called');
    }

    public function markArrived(QueueEntry $entry): QueueEntry
    {
        return $this->updateStatus($entry, QueueEntryStatus::Arrived, [
            'arrived_at' => now(),
        ]);
    }

    public function markInService(QueueEntry $entry): QueueEntry
    {
        return $this->updateStatus($entry, QueueEntryStatus::InService, [
            'in_service_at' => now(),
        ]);
    }

    public function markReady(QueueEntry $entry): QueueEntry
    {
        return $this->updateStatus($entry, QueueEntryStatus::Ready, [
            'ready_at' => now(),
        ], notify: true, notifyType: 'ready');
    }

    public function markCompleted(QueueEntry $entry): QueueEntry
    {
        return $this->updateStatus($entry, QueueEntryStatus::Completed, [
            'completed_at' => now(),
        ]);
    }

    public function markNoShow(QueueEntry $entry): QueueEntry
    {
        return $this->updateStatus($entry, QueueEntryStatus::NoShow, [
            'no_show_at' => now(),
        ]);
    }

    public function calculateEstimatedWait(int $branchId, ?Carbon $date = null): int
    {
        $date = $date ?? now();

        $waitingCount = QueueEntry::query()
            ->where('branch_id', $branchId)
            ->whereDate('queue_date', $date)
            ->whereIn('status', [
                QueueEntryStatus::Waiting,
                QueueEntryStatus::Arrived,
                QueueEntryStatus::InService,
            ])
            ->count();

        return $waitingCount * $this->averageServiceMinutes;
    }

    public function getScreenData(int $branchId, ?Carbon $date = null): array
    {
        $date = $date ?? now();

        $entries = QueueEntry::query()
            ->with(['customer', 'vehicle'])
            ->where('branch_id', $branchId)
            ->whereDate('queue_date', $date)
            ->whereNotIn('status', [QueueEntryStatus::Completed, QueueEntryStatus::NoShow])
            ->orderByDesc('priority')
            ->orderBy('queue_number')
            ->get();

        $current = $entries->first(fn (QueueEntry $e) => in_array($e->status, [
            QueueEntryStatus::Arrived,
            QueueEntryStatus::InService,
            QueueEntryStatus::Ready,
        ], true));

        return [
            'branch_id' => $branchId,
            'queue_date' => $date->toDateString(),
            'current_number' => $current?->queue_number,
            'current_status' => $current?->status?->value,
            'waiting_count' => $entries->where('status', QueueEntryStatus::Waiting)->count(),
            'estimated_wait_minutes' => $this->calculateEstimatedWait($branchId, $date),
            'entries' => $entries,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getPublicBranchSummaries(): array
    {
        return Branch::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(function (Branch $branch) {
                $screen = $this->getScreenData($branch->id);
                $entries = $screen['entries'];

                $inProgressCount = $entries
                    ->filter(fn (QueueEntry $entry) => in_array($entry->status, [
                        QueueEntryStatus::Arrived,
                        QueueEntryStatus::InService,
                        QueueEntryStatus::Ready,
                    ], true))
                    ->count();

                $waitingCount = (int) $screen['waiting_count'];
                $capacity = max(1, (int) ($branch->capacity_per_hour ?? 10));
                $loadPercent = min(100, (int) round((($waitingCount + $inProgressCount) / $capacity) * 100));

                return [
                    'branch_id' => $branch->id,
                    'branch_name' => $branch->name,
                    'city' => $branch->city,
                    'waiting_count' => $waitingCount,
                    'in_progress_count' => $inProgressCount,
                    'estimated_wait_minutes' => (int) $screen['estimated_wait_minutes'],
                    'load_percent' => $loadPercent,
                    'status_label' => $this->publicLoadStatusLabel($loadPercent),
                    'current_number' => $screen['current_number'],
                ];
            })
            ->values()
            ->all();
    }

    protected function publicLoadStatusLabel(int $loadPercent): string
    {
        return match (true) {
            $loadPercent >= 70 => 'مزدحم',
            $loadPercent >= 40 => 'مزدحم قليلاً',
            default => 'متاح الآن',
        };
    }

    public function calculateQueuePosition(QueueEntry $entry): ?int
    {
        if ($entry->status !== QueueEntryStatus::Waiting) {
            return null;
        }

        return QueueEntry::query()
            ->where('branch_id', $entry->branch_id)
            ->whereDate('queue_date', $entry->queue_date)
            ->where('status', QueueEntryStatus::Waiting)
            ->where(function ($query) use ($entry) {
                $query->where('priority', '>', $entry->priority)
                    ->orWhere(function ($nested) use ($entry) {
                        $nested->where('priority', $entry->priority)
                            ->where('queue_number', '<', $entry->queue_number);
                    });
            })
            ->count() + 1;
    }

    public function getAnalytics(int $branchId, Carbon $from, Carbon $to): array
    {
        $entries = QueueEntry::query()
            ->where('branch_id', $branchId)
            ->whereBetween('queue_date', [$from->toDateString(), $to->toDateString()])
            ->get();

        $completed = $entries->where('status', QueueEntryStatus::Completed);
        $noShows = $entries->where('status', QueueEntryStatus::NoShow);

        $avgWait = $completed
            ->filter(fn (QueueEntry $e) => $e->in_service_at && $e->created_at)
            ->avg(fn (QueueEntry $e) => $e->created_at->diffInMinutes($e->in_service_at));

        return [
            'total_entries' => $entries->count(),
            'walk_in_count' => $entries->where('source', QueueSource::WalkIn)->count(),
            'booked_count' => $entries->where('source', QueueSource::Booked)->count(),
            'completed_count' => $completed->count(),
            'no_show_count' => $noShows->count(),
            'no_show_rate' => $entries->count() > 0
                ? round(($noShows->count() / $entries->count()) * 100, 2)
                : 0,
            'average_wait_minutes' => round((float) $avgWait, 1),
            'by_status' => $entries->groupBy(fn (QueueEntry $e) => $e->status->value)
                ->map(fn (Collection $group) => $group->count())
                ->all(),
        ];
    }

    protected function updateStatus(
        QueueEntry $entry,
        QueueEntryStatus $status,
        array $timestamps = [],
        bool $notify = false,
        ?string $notifyType = null,
    ): QueueEntry {
        if (! $entry->status->canTransitionTo($status)) {
            throw new InvalidArgumentException(
                "لا يمكن تغيير حالة الطابور من {$entry->status->label()} إلى {$status->label()}."
            );
        }

        $previous = $entry->status->value;

        $entry->update(array_merge([
            'status' => $status,
            'estimated_wait_minutes' => $this->calculateEstimatedWait($entry->branch_id),
        ], $timestamps));

        QueueEntryStatusChanged::dispatch($entry->fresh(), $previous);

        if ($status === QueueEntryStatus::Arrived && isset($timestamps['called_at'])) {
            QueueEntryCalled::dispatch($entry->fresh());
        }

        if ($notify && $notifyType) {
            SendQueueNotificationJob::dispatch($entry->fresh(), $notifyType);
        }

        return $entry->fresh(['customer', 'vehicle', 'booking', 'order']);
    }

    protected function nextQueueNumber(int $branchId, Carbon $date): int
    {
        $last = QueueEntry::query()
            ->where('branch_id', $branchId)
            ->whereDate('queue_date', $date)
            ->lockForUpdate()
            ->max('queue_number');

        return ((int) $last) + 1;
    }
}
