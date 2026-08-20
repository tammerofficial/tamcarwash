<?php

namespace App\Modules\Queue\Http\Controllers;

use App\Modules\Booking\Models\Booking;
use App\Modules\Queue\Enums\QueueEntryStatus;
use App\Modules\Queue\Http\Requests\StoreQueueEntryRequest;
use App\Modules\Queue\Http\Requests\UpdateQueueStatusRequest;
use App\Modules\Queue\Http\Resources\QueueEntryResource;
use App\Modules\Queue\Models\QueueEntry;
use App\Modules\Queue\Services\QueueService;
use App\Modules\Shared\Http\Controllers\ApiController;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use RuntimeException;

class QueueController extends ApiController
{
    public function __construct(
        protected QueueService $queueService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', QueueEntry::class);

        $query = QueueEntry::query()
            ->with(['customer', 'vehicle', 'booking', 'order'])
            ->latest('queue_number');

        if ($request->filled('branch_id')) {
            $query->where('branch_id', $request->integer('branch_id'));
        }

        if ($request->filled('date')) {
            $query->whereDate('queue_date', $request->string('date'));
        } else {
            $query->whereDate('queue_date', today());
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('source')) {
            $query->where('source', $request->string('source'));
        }

        $entries = $query->paginate($request->integer('per_page', 50));

        return $this->paginatedList($entries, QueueEntryResource::class);
    }

    public function storeWalkIn(StoreQueueEntryRequest $request): JsonResponse
    {
        $entry = $this->queueService->addWalkIn($request->validated());

        return $this->success(
            QueueEntryResource::make($entry),
            'تم إضافة العميل إلى الطابور.',
            201
        );
    }

    public function storeFromBooking(Booking $booking): JsonResponse
    {
        $this->authorize('create', QueueEntry::class);

        try {
            $entry = $this->queueService->addFromBooking($booking);

            return $this->success(
                QueueEntryResource::make($entry),
                'تم إضافة الحجز إلى الطابور.',
                201
            );
        } catch (RuntimeException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function show(QueueEntry $queueEntry): JsonResponse
    {
        $this->authorize('view', $queueEntry);

        $queueEntry->load(['customer', 'vehicle', 'booking', 'order']);

        return $this->success(QueueEntryResource::make($queueEntry));
    }

    public function callNext(Request $request): JsonResponse
    {
        $this->authorize('callNext', QueueEntry::class);

        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'date' => ['nullable', 'date'],
        ]);

        $entry = $this->queueService->callNext(
            $request->integer('branch_id'),
            $request->filled('date') ? Carbon::parse($request->string('date')) : null
        );

        if (! $entry) {
            return $this->success(null, 'لا يوجد عملاء في الانتظار.');
        }

        return $this->success(QueueEntryResource::make($entry), 'تم استدعاء العميل التالي.');
    }

    public function updateStatus(UpdateQueueStatusRequest $request, QueueEntry $queueEntry): JsonResponse
    {
        try {
            $entry = match ($request->enum('status', QueueEntryStatus::class)) {
                QueueEntryStatus::Arrived => $this->queueService->markArrived($queueEntry),
                QueueEntryStatus::InService => $this->queueService->markInService($queueEntry),
                QueueEntryStatus::Ready => $this->queueService->markReady($queueEntry),
                QueueEntryStatus::Completed => $this->queueService->markCompleted($queueEntry),
                QueueEntryStatus::NoShow => $this->queueService->markNoShow($queueEntry),
                default => throw new InvalidArgumentException('حالة غير مدعومة.'),
            };

            return $this->success(QueueEntryResource::make($entry), 'تم تحديث حالة الطابور.');
        } catch (InvalidArgumentException $e) {
            return $this->error($e->getMessage(), 422);
        }
    }

    public function estimatedWait(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'date' => ['nullable', 'date'],
        ]);

        $minutes = $this->queueService->calculateEstimatedWait(
            $request->integer('branch_id'),
            $request->filled('date') ? Carbon::parse($request->string('date')) : null
        );

        return $this->success(['estimated_wait_minutes' => $minutes]);
    }

    public function screen(Request $request): JsonResponse
    {
        $this->authorize('viewScreen', QueueEntry::class);

        return $this->screenResponse($request);
    }

    public function publicScreen(Request $request): JsonResponse
    {
        return $this->screenResponse($request);
    }

    protected function screenResponse(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'date' => ['nullable', 'date'],
        ]);

        $data = $this->queueService->getScreenData(
            $request->integer('branch_id'),
            $request->filled('date') ? Carbon::parse($request->string('date')) : null
        );

        $data['entries'] = QueueEntryResource::collection($data['entries']);

        return $this->success($data);
    }

    public function analytics(Request $request): JsonResponse
    {
        $this->authorize('viewAnalytics', QueueEntry::class);

        $request->validate([
            'branch_id' => ['required', 'integer', 'exists:branches,id'],
            'from' => ['required', 'date'],
            'to' => ['required', 'date', 'after_or_equal:from'],
        ]);

        $analytics = $this->queueService->getAnalytics(
            $request->integer('branch_id'),
            Carbon::parse($request->string('from')),
            Carbon::parse($request->string('to'))
        );

        return $this->success($analytics);
    }
}
