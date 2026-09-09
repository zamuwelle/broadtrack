<?php

namespace App\Observers;

use App\Events\UserUpdated;
use App\Models\User;

class UserObserver
{
    public function created(User $user): void
    {
        broadcast(new UserUpdated('created', $user->id));
    }

    public function updated(User $user): void
    {
        broadcast(new UserUpdated('updated', $user->id));
    }

    public function deleted(User $user): void
    {
        broadcast(new UserUpdated('deleted', (int)$user->id));
    }
}
