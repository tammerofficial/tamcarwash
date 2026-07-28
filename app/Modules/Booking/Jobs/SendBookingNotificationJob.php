<?php

namespace App\Modules\Booking\Jobs;

use App\Modules\Booking\Contracts\SmsNotifierInterface;
use App\Modules\Booking\Contracts\WhatsAppNotifierInterface;
use App\Modules\Booking\Models\Booking;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendBookingNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public string $eventType,
    ) {}

    public function handle(
        WhatsAppNotifierInterface $whatsApp,
        SmsNotifierInterface $sms,
    ): void {
        $booking = $this->booking->loadMissing(['customer', 'branch']);

        $phone = $booking->customer?->phone ?? null;

        if (! $phone) {
            return;
        }

        $context = [
            'booking_number' => $booking->booking_number,
            'branch' => $booking->branch?->name ?? '',
            'date' => $booking->scheduled_date?->format('Y-m-d'),
            'time' => $booking->scheduled_start_time,
        ];

        $whatsApp->send($phone, "booking.{$this->eventType}", $context);

        $message = match ($this->eventType) {
            'confirmed' => "تم تأكيد حجزك رقم {$booking->booking_number}",
            'cancelled' => "تم إلغاء حجزك رقم {$booking->booking_number}",
            'rescheduled' => "تم إعادة جدولة حجزك رقم {$booking->booking_number}",
            'completed' => "اكتمل حجزك رقم {$booking->booking_number}",
            default => "تحديث على حجزك رقم {$booking->booking_number}",
        };

        $sms->send($phone, $message, $context);
    }
}
