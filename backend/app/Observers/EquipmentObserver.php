<?php

namespace App\Observers;

use App\Events\EquipmentUpdated;
use App\Models\Equipment;

class EquipmentObserver
{
    public function created(Equipment $equipment): void
    {
        rescue(static fn () => broadcast(new EquipmentUpdated('created', $equipment->id)), report: false);
    }

    public function updated(Equipment $equipment): void
    {
        rescue(static fn () => broadcast(new EquipmentUpdated('updated', $equipment->id)), report: false);
    }

    public function deleted(Equipment $equipment): void
    {
        rescue(static fn () => broadcast(new EquipmentUpdated('deleted', (int)$equipment->id)), report: false);
    }
}
