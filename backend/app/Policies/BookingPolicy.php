<?php

namespace App\Policies;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    public function view(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $booking->user_id === $user->id;
    }

    public function cancel(User $user, Booking $booking): bool
    {
        $isAuthorized = $user->isAdmin() || $booking->user_id === $user->id;
        $isCancellable = in_array($booking->status, [BookingStatus::Pending, BookingStatus::Approved], true);

        return $isAuthorized && $isCancellable;
    }

    public function markAsRead(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $booking->user_id === $user->id;
    }

    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
