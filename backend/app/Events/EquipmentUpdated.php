<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class EquipmentUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(public $action = 'updated', public $equipmentId = null) {}

    public function broadcastOn()
    {
        return [new Channel('equipment')];
    }

    public function broadcastAs()
    {
        return 'equipment.changed';
    }
}
