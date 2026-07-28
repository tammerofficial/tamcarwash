<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Enums\BookingSource;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Events\BookingCancelled;
use App\Modules\Booking\Events\BookingCompleted;
use App\Modules\Booking\Events\BookingConfirmed;
use App\Modules\Booking\Events\BookingConvertedToOrder;
use App\Modules\Booking\Events\BookingCreated;
use App\Modules\Booking\Events\BookingRescheduled;
use App\Modules\Booking\Jobs\SendBookingNotificationJob;
use App\Modules\Booking\Models\Booking;
use App\Modules\Orders\Services\OrderService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class BookingService
{
    public function __construct(
        protected TimeSlotService $timeSlotService,
        protected OrderService $orderService,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Booking
    {
        return DB::transaction(function () use ($data) {
            $timeSlot = null;

            if (! empty($data['time_slot_id'])) {
                $timeSlot = $this->timeSlotService->reserveSlot((int) $data['time_slot_id']);
            }

            $booking = Booking::query()->create([
                'booking_number' => $this->generateBookingNumber(),
                'branch_id' => $data['branch_id'],
                'customer_id' => $data['customer_id'],
                'vehicle_id' => $data['vehicle_id'],
                'time_slot_id' => $timeSlot?->id,
                'scheduled_date' => $data['scheduled_date'],
                'scheduled_start_time' => $data['scheduled_start_time'],
                'scheduled_end_time' => $data['scheduled_end_time'] ?? $timeSlot?->end_time,
                'status' => BookingStatus::Pending,
                'source' => $data['source'] ?? BookingSource::Online,
                'notes' => $data['notes'] ?? null,
                'service_ids' => $data['service_ids'] ?? [],
                'metadata' => $data['metadata'] ?? [],
            ]);

            BookingCreated::dispatch($booking);
            SendBookingNotificationJob::dispatch($booking, 'created');

            return $booking->fresh(['timeSlot', 'customer', 'vehicle', 'branch']);
        });
    }

    public function confirm(Booking $booking): Booking
    {
        $this->assertTransition($booking, BookingStatus::Confirmed);

        $booking->update([
            'status' => BookingStatus::Confirmed,
            'confirmed_at' => now(),
        ]);

        BookingConfirmed::dispatch($booking);
        SendBookingNotificationJob::dispatch($booking, 'confirmed');

        return $booking->fresh();
    }

    public function cancel(Booking $booking, ?string $reason = null): Booking
    {
        $this->assertTransition($booking, BookingStatus::Cancelled);

        $booking->update([
            'status' => BookingStatus::Cancelled,
            'cancelled_at' => now(),
            'cancellation_reason' => $reason,
        ]);

        $this->timeSlotService->releaseSlot($booking->time_slot_id);

        BookingCancelled::dispatch($booking);
        SendBookingNotificationJob::dispatch($booking, 'cancelled');

        return $booking->fresh();
    }

    /**
     * @param  array<string, mixed>  $schedule
     */
    public function reschedule(Booking $booking, array $schedule): Booking
    {
        if (! $booking->status->isActive()) {
            throw new InvalidArgumentException('لا يمكن إعادة جدولة حجز غير نشط.');
        }

        $previous = [
            'scheduled_date' => $booking->scheduled_date?->toDateString(),
            'scheduled_start_time' => $booking->scheduled_start_time,
            'scheduled_end_time' => $booking->scheduled_end_time,
            'time_slot_id' => $booking->time_slot_id,
        ];

        return DB::transaction(function () use ($booking, $schedule, $previous) {
            $oldSlotId = $booking->time_slot_id;
            $newSlot = null;

            if (! empty($schedule['time_slot_id']) && (int) $schedule['time_slot_id'] !== (int) $oldSlotId) {
                $this->timeSlotService->releaseSlot($oldSlotId);
                $newSlot = $this->timeSlotService->reserveSlot((int) $schedule['time_slot_id']);
            }

            $booking->update([
                'scheduled_date' => $schedule['scheduled_date'] ?? $booking->scheduled_date,
                'scheduled_start_time' => $schedule['scheduled_start_time'] ?? $booking->scheduled_start_time,
                'scheduled_end_time' => $schedule['scheduled_end_time'] ?? $booking->scheduled_end_time,
                'time_slot_id' => $newSlot?->id ?? $booking->time_slot_id,
            ]);

            BookingRescheduled::dispatch($booking, $previous);
            SendBookingNotificationJob::dispatch($booking, 'rescheduled');

            return $booking->fresh(['timeSlot']);
        });
    }

    public function complete(Booking $booking): Booking
    {
        $this->assertTransition($booking, BookingStatus::Completed);

        $booking->update([
            'status' => BookingStatus::Completed,
            'completed_at' => now(),
        ]);

        BookingCompleted::dispatch($booking);
        SendBookingNotificationJob::dispatch($booking, 'completed');

        return $booking->fresh();
    }

    /**
     * @param  array<string, mixed>  $orderData
     */
    public function convertToOrder(Booking $booking, array $orderData = []): Booking
    {
        if ($booking->order_id) {
            throw new RuntimeException('تم تحويل هذا الحجز إلى طلب مسبقاً.');
        }

        if (! in_array($booking->status, [BookingStatus::Confirmed, BookingStatus::Pending], true)) {
            throw new InvalidArgumentException('لا يمكن تحويل هذا الحجز إلى طلب.');
        }

        return DB::transaction(function () use ($booking, $orderData) {
            $order = $this->orderService->createFromBooking($booking, $orderData);

            $booking->update([
                'order_id' => $order->id,
                'status' => BookingStatus::Completed,
                'completed_at' => now(),
            ]);

            BookingConvertedToOrder::dispatch($booking, $order->id);
            SendBookingNotificationJob::dispatch($booking, 'converted');

            return $booking->fresh(['order']);
        });
    }

    protected function assertTransition(Booking $booking, BookingStatus $target): void
    {
        if (! $booking->status->canTransitionTo($target)) {
            throw new InvalidArgumentException(
                "لا يمكن تغيير حالة الحجز من {$booking->status->label()} إلى {$target->label()}."
            );
        }
    }

    protected function generateBookingNumber(): string
    {
        return 'BK-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
    }
}
