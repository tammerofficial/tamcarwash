<?php

namespace App\Modules\Booking\Contracts;

interface WhatsAppNotifierInterface
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function send(string $phone, string $template, array $context = []): void;
}
