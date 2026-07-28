<?php

namespace App\Modules\Booking\Contracts;

interface SmsNotifierInterface
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function send(string $phone, string $message, array $context = []): void;
}
