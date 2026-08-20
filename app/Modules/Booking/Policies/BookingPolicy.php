<?php

namespace App\Modules\Booking\Policies;

use App\Models\TenantUser;
use App\Modules\Booking\Models\Booking;
use App\Modules\Shared\Policies\HasModulePermission;

class BookingPolicy
{
    use HasModulePermission;

    public function viewAny(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'bookings.view');
    }

    public function view(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.view');
    }

    public function create(TenantUser $user): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function update(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function delete(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function confirm(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function cancel(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function reschedule(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }

    public function convertToOrder(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.manage');
    }
}
