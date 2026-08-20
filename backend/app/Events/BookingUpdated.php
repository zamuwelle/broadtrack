<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class BookingUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public $action = 'updated', public $bookingId = null, public $booking = null) {}

    public function broadcastOn()
    {
        return [new Channel('bookings')];
    }

    public function broadcastAs()
    {
        return 'booking.changed';
    }
}
