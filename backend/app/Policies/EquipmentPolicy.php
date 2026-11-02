<?php

namespace App\Policies;

use App\Models\User;

class EquipmentPolicy
{
    public function manage(User $user): bool
    {
        return $user->isAdmin();
    }
}
