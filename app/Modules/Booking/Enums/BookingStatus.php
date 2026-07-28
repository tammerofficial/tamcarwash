<?php

namespace App\Modules\Booking\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'قيد الانتظار',
            self::Confirmed => 'مؤكد',
            self::Cancelled => 'ملغي',
            self::Completed => 'مكتمل',
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::Cancelled, self::Completed],
            self::Cancelled, self::Completed => [],
        };
    }

    public function isActive(): bool
    {
        return in_array($this, [self::Pending, self::Confirmed], true);
    }
}
