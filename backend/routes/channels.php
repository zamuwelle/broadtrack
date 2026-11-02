<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', static fn ($user, $id) => (int)$user->id === (int)$id);
