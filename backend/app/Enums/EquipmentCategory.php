<?php

namespace App\Enums;

enum EquipmentCategory: string
{
    case Camera = 'Camera';
    case Video = 'Video';
    case Audio = 'Audio';
    case Lighting = 'Lighting';
    case Support = 'Support';
    case Cables = 'Cables';
    case Others = 'Others';
}
