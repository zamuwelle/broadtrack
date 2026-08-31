<?php

namespace App\Events;

use App\Models\Booking;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class BookingUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(
        public string $action = 'updated',
        public ?int $bookingId = null,
        public ?Booking $booking = null
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('bookings')];
    }

    public function broadcastAs(): string
    {
        return 'booking.changed';
    }
}
