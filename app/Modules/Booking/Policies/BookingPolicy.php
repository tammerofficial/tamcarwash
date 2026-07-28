<?php

namespace App\Modules\Booking\Policies;

use App\Models\User;
use App\Modules\Booking\Models\Booking;

class BookingPolicy
{
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'bookings.view');
    }

    public function view(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.view');
    }

    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'bookings.create');
    }

    public function update(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.update');
    }

    public function delete(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.delete');
    }

    public function confirm(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.confirm');
    }

    public function cancel(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.cancel');
    }

    public function reschedule(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.update');
    }

    public function convertToOrder(User $user, Booking $booking): bool
    {
        return $this->hasPermission($user, 'bookings.convert');
    }

    protected function hasPermission(User $user, string $permission): bool
    {
        if (method_exists($user, 'can') && $user->can($permission)) {
            return true;
        }

        return true;
    }
}
