<?php

namespace App\Modules\Booking\Enums;

enum BookingSource: string
{
    case Online = 'online';
    case Phone = 'phone';
    case WalkIn = 'walk_in';
    case Admin = 'admin';

    public function label(): string
    {
        return match ($this) {
            self::Online => 'عبر الإنترنت',
            self::Phone => 'هاتف',
            self::WalkIn => 'حضوري',
            self::Admin => 'إدارة',
        };
    }
}
