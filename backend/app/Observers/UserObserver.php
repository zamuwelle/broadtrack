<?php

namespace App\Observers;

use App\Events\UserUpdated;
use App\Models\User;

class UserObserver
{
    public function created(User $user): void
    {
        rescue(static fn () => broadcast(new UserUpdated('created', $user->id)), report: false);
    }

    public function updated(User $user): void
    {
        rescue(static fn () => broadcast(new UserUpdated('updated', $user->id)), report: false);
    }

    public function deleted(User $user): void
    {
        rescue(static fn () => broadcast(new UserUpdated('deleted', (int)$user->id)), report: false);
    }
}
