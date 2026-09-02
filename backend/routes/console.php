<?php

use App\Console\Commands\SendReturnDueEmailRemindersCommand;
use App\Models\User;
use Illuminate\Support\Facades\Schedule;

Schedule::command(SendReturnDueEmailRemindersCommand::class)->daily();
Schedule::command('sanctum:prune-expired --hours=24')->daily();
Schedule::command('model:prune', [
    '--model' => [User::class],
])->daily();
