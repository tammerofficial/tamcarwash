<?php

namespace App\Modules\Queue\Enums;

enum QueueEntryStatus: string
{
    case Waiting = 'waiting';
    case Arrived = 'arrived';
    case InService = 'in_service';
    case Ready = 'ready';
    case Completed = 'completed';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::Waiting => 'في الانتظار',
            self::Arrived => 'وصل',
            self::InService => 'قيد الخدمة',
            self::Ready => 'جاهز للاستلام',
            self::Completed => 'مكتمل',
            self::NoShow => 'لم يحضر',
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Waiting => [self::Arrived, self::InService, self::NoShow],
            self::Arrived => [self::InService, self::NoShow],
            self::InService => [self::Ready, self::Completed],
            self::Ready => [self::Completed],
            self::Completed, self::NoShow => [],
        };
    }

    public function isActive(): bool
    {
        return ! in_array($this, [self::Completed, self::NoShow], true);
    }
}
