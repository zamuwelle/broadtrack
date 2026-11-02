<?php

namespace App\Console\Commands;

use App\Enums\BookingStatus;
use App\Models\Booking;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Description('Automatically cancel pending booking requests whose scheduled end date has passed')]
#[Signature('bookings:cancel-expired')]
class CancelExpiredPendingBookingsCommand extends Command
{
    public function handle(): int
    {
        $expiredBookings = Booking::where('status', BookingStatus::Pending)
            ->where('end_date', '<', now())
            ->get();

        foreach ($expiredBookings as $booking) {
            $booking->update([
                'status' => BookingStatus::Cancelled,
                'rejection_reason' => 'Auto-cancelled: Request expired without approval',
                'isRead' => false,
            ]);
        }

        $count = $expiredBookings->count();
        $this->info("Cancelled {$count} expired pending booking(s)");

        return self::SUCCESS;
    }
}
