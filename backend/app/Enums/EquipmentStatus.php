<?php

namespace App\Enums;

enum EquipmentStatus: string
{
    case Available = 'available';
    case Booked = 'booked';
    case Borrowed = 'borrowed';
    case Maintenance = 'maintenance';
}
