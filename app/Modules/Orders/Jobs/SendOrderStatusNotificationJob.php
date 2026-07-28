<?php

namespace App\Modules\Orders\Jobs;

use App\Modules\Booking\Contracts\SmsNotifierInterface;
use App\Modules\Booking\Contracts\WhatsAppNotifierInterface;
use App\Modules\Orders\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendOrderStatusNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public Order $order,
        public string $previousStatus,
    ) {}

    public function handle(
        WhatsAppNotifierInterface $whatsApp,
        SmsNotifierInterface $sms,
    ): void {
        $order = $this->order->loadMissing(['customer', 'branch']);

        $phone = $order->customer?->phone ?? null;

        if (! $phone) {
            return;
        }

        $context = [
            'order_number' => $order->order_number,
            'status' => $order->status->label(),
            'branch' => $order->branch?->name ?? '',
        ];

        $whatsApp->send($phone, 'order.status_changed', $context);
        $sms->send($phone, "تحديث طلبك {$order->order_number}: {$order->status->label()}", $context);
    }
}
