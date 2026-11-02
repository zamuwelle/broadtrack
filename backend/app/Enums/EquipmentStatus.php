<?php

namespace App\Enums;

enum EquipmentStatus: string
{
	case Available = 'available';
	case Borrowed = 'borrowed';
	case Maintenance = 'maintenance';
}