<?php

namespace App\Modules\Orders\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case CheckedIn = 'checked_in';
    case Queued = 'queued';
    case InService = 'in_service';
    case QualityCheck = 'quality_check';
    case Ready = 'ready';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'جديد',
            self::CheckedIn => 'تم التسجيل',
            self::Queued => 'في الطابور',
            self::InService => 'قيد الخدمة',
            self::QualityCheck => 'فحص الجودة',
            self::Ready => 'جاهز',
            self::Completed => 'مكتمل',
            self::Cancelled => 'ملغي',
        };
    }

    public function canTransitionTo(self $status): bool
    {
        return in_array($status, $this->allowedTransitions(), true);
    }

    public function allowedTransitions(): array
    {
        return match ($this) {
            self::Pending => [self::CheckedIn, self::Cancelled],
            self::CheckedIn => [self::Queued, self::InService, self::Cancelled],
            self::Queued => [self::InService, self::Cancelled],
            self::InService => [self::QualityCheck, self::Ready, self::Cancelled],
            self::QualityCheck => [self::Ready, self::InService, self::Cancelled],
            self::Ready => [self::Completed, self::Cancelled],
            self::Completed, self::Cancelled => [],
        };
    }

    public function timestampColumn(): ?string
    {
        return match ($this) {
            self::CheckedIn => 'checked_in_at',
            self::Queued => 'queued_at',
            self::InService => 'in_service_at',
            self::QualityCheck => 'quality_check_at',
            self::Ready => 'ready_at',
            self::Completed => 'completed_at',
            self::Cancelled => 'cancelled_at',
            default => null,
        };
    }

    public function isActive(): bool
    {
        return ! in_array($this, [self::Completed, self::Cancelled], true);
    }
}
