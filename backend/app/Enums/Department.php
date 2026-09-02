<?php

namespace App\Enums;

enum Department: string
{
    case Broadcasting = 'BA Broadcasting';
    case InformationSystems = 'BS Information Systems';
    case ComputerTechnology = 'Associate in Computer Technology';
    case Accountancy = 'BS Accountancy';
    case AccountancyInformationSystems = 'BS Accountancy in Information Systems';
    case SocialWork = 'BS Social Work';

    public function shorthand(): string
    {
        return match ($this) {
            self::Broadcasting => 'BAB',
            self::InformationSystems => 'BSIS',
            self::ComputerTechnology => 'ACT',
            self::Accountancy => 'BSA',
            self::AccountancyInformationSystems => 'BSAIS',
            self::SocialWork => 'BSSW',
        };
    }
}
