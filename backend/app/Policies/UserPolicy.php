<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isSysAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isSysAdmin();
    }

    public function update(User $user): bool
    {
        return $user->isSysAdmin();
    }

    public function delete(User $currentUser, User $targetUser): bool
    {
        return $currentUser->isSysAdmin() && (int)$currentUser->id !== (int)$targetUser->id;
    }
}
