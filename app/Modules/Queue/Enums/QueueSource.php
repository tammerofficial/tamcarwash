<?php

namespace App\Modules\Queue\Enums;

enum QueueSource: string
{
    case WalkIn = 'walk_in';
    case Booked = 'booked';

    public function label(): string
    {
        return match ($this) {
            self::WalkIn => 'حضور مباشر',
            self::Booked => 'حجز',
        };
    }
}
