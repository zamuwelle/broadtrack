<?php

namespace App\Observers;

use App\Events\EquipmentUpdated;
use App\Models\Equipment;

class EquipmentObserver
{
    public function created(Equipment $equipment): void
    {
        broadcast(new EquipmentUpdated('created', $equipment->id));
    }

    public function updated(Equipment $equipment): void
    {
        broadcast(new EquipmentUpdated('updated', $equipment->id));
    }

    public function deleted(Equipment $equipment): void
    {
        broadcast(new EquipmentUpdated('deleted', (int)$equipment->id));
    }
}
