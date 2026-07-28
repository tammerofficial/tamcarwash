<?php

namespace App\Modules\Queue\Jobs;

use App\Modules\Booking\Contracts\SmsNotifierInterface;
use App\Modules\Booking\Contracts\WhatsAppNotifierInterface;
use App\Modules\Queue\Models\QueueEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendQueueNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public QueueEntry $entry,
        public string $eventType,
    ) {}

    public function handle(
        WhatsAppNotifierInterface $whatsApp,
        SmsNotifierInterface $sms,
    ): void {
        $entry = $this->entry->loadMissing(['customer', 'branch']);

        $phone = $entry->customer?->phone ?? null;

        if (! $phone) {
            return;
        }

        $context = [
            'queue_number' => $entry->queue_number,
            'branch' => $entry->branch?->name ?? '',
            'status' => $entry->status->value,
        ];

        $whatsApp->send($phone, "queue.{$this->eventType}", $context);

        $message = match ($this->eventType) {
            'called' => "دورك الآن! رقم {$entry->queue_number}",
            'ready' => "سيارتك جاهزة للاستلام - رقم {$entry->queue_number}",
            default => "تحديث الطابور - رقم {$entry->queue_number}",
        };

        $sms->send($phone, $message, $context);
    }
}
