<?php

namespace App\Modules\Booking\Policies;

use App\Models\TenantUser;
use App\Modules\Booking\Models\Booking;

class BookingPolicy
{
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
        return $this->hasPermission($user, 'bookings.create');
    }

    public function update(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.update');
    }

    public function delete(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.delete');
    }

    public function confirm(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.confirm');
    }

    public function cancel(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.cancel');
    }

    public function reschedule(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.update');
    }

    public function convertToOrder(TenantUser $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.convert');
    }

    protected function hasPermission(TenantUser $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
