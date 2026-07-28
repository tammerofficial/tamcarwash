<?php

namespace App\Modules\Orders\Enums;

enum OrderSource: string
{
    case WalkIn = 'walk_in';
    case Booking = 'booking';
    case Phone = 'phone';

    public function label(): string
    {
        return match ($this) {
            self::WalkIn => 'حضور مباشر',
            self::Booking => 'حجز',
            self::Phone => 'هاتف',
        };
    }
}
