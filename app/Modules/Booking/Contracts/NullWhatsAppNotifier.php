<?php

namespace App\Modules\Booking\Contracts;

class NullWhatsAppNotifier implements WhatsAppNotifierInterface
{
    public function send(string $phone, string $template, array $context = []): void
    {
        // Hook for future WhatsApp integration
    }
}
