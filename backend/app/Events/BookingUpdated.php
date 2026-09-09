<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Contracts\Broadcasting\ShouldRescue;
use Illuminate\Contracts\Events\ShouldDispatchAfterCommit;
use Illuminate\Queue\SerializesModels;

class BookingUpdated implements ShouldBroadcastNow, ShouldDispatchAfterCommit, ShouldRescue
{
    use SerializesModels;

    public function __construct(
        public string $action = 'updated',
        public ?int $bookingId = null
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
