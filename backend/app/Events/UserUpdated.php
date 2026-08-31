<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class UserUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(
        public string $action = 'updated',
        public ?int $userId = null
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('users')];
    }

    public function broadcastAs(): string
    {
        return 'user.changed';
    }
}
