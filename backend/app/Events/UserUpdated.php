<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class UserUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public $action = 'updated', public $userId = null) {}

    public function broadcastOn()
    {
        return [new Channel('users')];
    }

    public function broadcastAs()
    {
        return 'user.changed';
    }
}
