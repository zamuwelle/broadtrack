<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Queue\SerializesModels;

class EquipmentUpdated implements ShouldBroadcastNow
{
    use SerializesModels;

    public function __construct(
        public string $action = 'updated',
        public ?int $equipmentId = null
    ) {}

    public function broadcastOn(): array
    {
        return [new Channel('equipment')];
    }

    public function broadcastAs(): string
    {
        return 'equipment.changed';
    }
}
