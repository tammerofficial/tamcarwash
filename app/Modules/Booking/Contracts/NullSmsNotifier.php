<?php

namespace App\Modules\Booking\Contracts;

class NullSmsNotifier implements SmsNotifierInterface
{
    public function send(string $phone, string $message, array $context = []): void
    {
        // Hook for future SMS integration
    }
}
